import { scenePreview } from "@shared/templates/scene";
import { errorHandlerWrapper, transactionWrapper } from "./dataAccessUtils";
import { queryDB, updateDB } from "./dbOperations";

export function getCharacter(characterId: number): any {
  return transactionWrapper("getCharacter", (container) => {
    // Get character
    const characterQuery = `
      SELECT * FROM Character WHERE id = ?;
    `;
    const characterParams = [characterId];
    const character = queryDB(characterQuery, characterParams)[0];
    container["character"] = character;
    // Get relationships
    const relationshipQuery = `
      SELECT cr.related_character_id AS id, c.name AS name, c.role AS role, cr.description AS description
      FROM CharacterRelationship cr
      JOIN Character c ON cr.related_character_id = c.id
      WHERE cr.character_id = ?;
    `;
    const relationshipParams = [characterId];
    const relationships = queryDB(relationshipQuery, relationshipParams);
    container["relationships"] = relationships;
    // Get connected plot points
    const plotPointQuery = `
      SELECT pp.id, pp.title, pp.description
      FROM CharacterPlotPoint cpp
      JOIN PlotPoint pp ON cpp.plot_point_id = pp.id
      WHERE cpp.character_id = ?;
    `;
    const plotPointParams = [characterId];
    const connectedPlotPoints = queryDB(plotPointQuery, plotPointParams);
    container["connectedPlotPoints"] = connectedPlotPoints;
    // Get connected scenes
    const sceneQuery = `
      SELECT s.id, s.version, s.title, s.scene_text, s.scene_order, s.overview, s.created_at, s.edited_at
      FROM SceneCharacter sc
      JOIN Scene s ON sc.scene_id = s.id AND sc.scene_version = s.version
      WHERE sc.character_id = ?;
    `;
    const sceneParams = [characterId];
    const connectedScenes: scenePreview[] = queryDB(sceneQuery, sceneParams);
    container["connectedScenes"] = connectedScenes;
  });
}

export function getAllCharacters(storyId: number): any[] {
  return errorHandlerWrapper("getAllCharacters", () => {
    const query = `
      SELECT id, name, role, created_at AS createdAt, edited_at AS editedAt FROM Character WHERE story_id = ? ORDER BY edited_at DESC;
    `;
    const params = [storyId];
    const result = queryDB(query, params);
    return result;
  });
}

export function createNewCharacter(storyId: number, name: string, role: string, physicalDescription: string, personality: string, backstory: string, additionalNotes: string, relationships: any[], connectedPlotPointIds: number[], connectedScenes: scenePreview[]): any {
  return transactionWrapper("createNewCharacter", (container) => {
    // Create character
    const createQuery = `
      INSERT INTO Character (story_id, name, role, physical_description, personality, backstory, additional_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const createParams = [storyId, name, role, physicalDescription, personality, backstory, additionalNotes];
    const result = updateDB(createQuery, createParams);
    const characterId = result.lastInsertRowid;
    // Create relationships
    const relationshipQuery = `
      INSERT INTO CharacterRelationship (character_id, related_character_id, description)
      VALUES ${relationships.map(() => "(?, ?, ?)").join(", ")};
    `;
    const relationshipParams = relationships.flatMap((relationship) => [characterId, relationship.id, relationship.description]);
    updateDB(relationshipQuery, relationshipParams);
    // Connect plot points
    const plotPointQuery = `
      INSERT INTO CharacterPlotPoint (character_id, plot_point_id)
      VALUES ${connectedPlotPointIds.map(() => "(?, ?)").join(", ")};
    `;
    const plotPointParams = connectedPlotPointIds.flatMap((plotPointId) => [characterId, plotPointId]);
    updateDB(plotPointQuery, plotPointParams);
    // Connect scenes
    const sceneQuery = `
      INSERT INTO SceneCharacter (character_id, scene_id, scene_version)
      VALUES ${connectedScenes.map(() => "(?, ?, ?)").join(", ")};
    `;
    const sceneParams = connectedScenes.flatMap((scene: scenePreview) => [characterId, scene.id, scene.version]);
    updateDB(sceneQuery, sceneParams);
    container["characterId"] = characterId;
  });
}

export function updateCharacter(characterId: number, name: string, role: string, physicalDescription: string, personality: string, backstory: string, additionalNotes: string, relationships: any[], connectedPlotPointIds: number[], connectedScenes: scenePreview[]): void {
  function processRelationships() {
    // Delete old relationships
    const deleteRelationshipsPrompt = `
      DELETE FROM CharacterRelationship
      WHERE character_id = ?
      AND related_character_id NOT IN (${relationships.map(() => "?").join(", ")});
    `;
    const deleteRelationshipsParams = [characterId, ...relationships.map((r) => r.id)];
    updateDB(deleteRelationshipsPrompt, deleteRelationshipsParams);
    // Add new relationships
    const newRelationshipsPrompt = `
      INSERT INTO CharacterRelationship (character_id, related_character_id, description)
      VALUES ${relationships.map(() => "(?, ?, ?)").join(", ")}
      ON CONFLICT(character_id, related_character_id) DO UPDATE SET description = excluded.description;
    `;
    const newRelationshipsParams = relationships.flatMap((relationship) => [characterId, relationship.id, relationship.description]);
    updateDB(newRelationshipsPrompt, newRelationshipsParams);
  }

  function processConnectedPlotPoints() {
    // Delete old plot points
    const deletePlotPointsPrompt = `
      DELETE FROM CharacterPlotPoint
      WHERE character_id = ?
      AND plot_point_id NOT IN (${connectedPlotPointIds.map(() => "?").join(", ")});
    `;
    const deletePlotPointsParams = [characterId, ...connectedPlotPointIds];
    updateDB(deletePlotPointsPrompt, deletePlotPointsParams);
    // Add new plot points
    const newPlotPointsPrompt = `
      INSERT INTO CharacterPlotPoint (character_id, plot_point_id)
      VALUES ${connectedPlotPointIds.map(() => "(?, ?)").join(", ")}
      ON CONFLICT(character_id, plot_point_id) DO NOTHING;
    `;
    const newPlotPointsParams = connectedPlotPointIds.flatMap((plotPointId) => [characterId, plotPointId]);
    updateDB(newPlotPointsPrompt, newPlotPointsParams);
  }

  function processConnectedScenes() {
    // Delete old scenes
    const deleteScenesPrompt = `
      DELETE FROM SceneCharacter
      WHERE character_id = ?
      AND (scene_id, scene_version) NOT IN (${connectedScenes.map(() => "(?, ?)").join(", ")});
    `;
    const deleteScenesParams = [characterId, ...connectedScenes.flatMap((scene: scenePreview) => [scene.id, scene.version])];
    updateDB(deleteScenesPrompt, deleteScenesParams);
    // Add new scenes
    const newScenesPrompt = `
      INSERT INTO SceneCharacter (character_id, scene_id, scene_version)
      VALUES ${connectedScenes.map(() => "(?, ?, ?)").join(", ")}
      ON CONFLICT(character_id, scene_id, scene_version) DO NOTHING;
    `;
    const newScenesParams = connectedScenes.flatMap((scene: scenePreview) => [characterId, scene.id, scene.version]);
    updateDB(newScenesPrompt, newScenesParams);
  }

  return transactionWrapper("updateCharacter", (_) => {
    // Update character
    const characterQuery = `
      UPDATE Character
      SET name = ?, role = ?, physical_description = ?, personality = ?, backstory = ?, additional_notes = ?, edited_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;
    const characterParams = [name, role, physicalDescription, personality, backstory, additionalNotes, characterId];
    updateDB(characterQuery, characterParams);
    processRelationships();
    processConnectedPlotPoints();
    processConnectedScenes();
  });
}

export function deleteCharacter(characterId: number): void {
  return errorHandlerWrapper("deleteCharacter", () => {
    const query = `
      DELETE FROM Character WHERE id = ?;
    `;
    const params = [characterId];
    updateDB(query, params);
  });
}