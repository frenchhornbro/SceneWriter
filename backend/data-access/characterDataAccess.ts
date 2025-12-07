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
      SELECT s.id, s.title, s.overview
      FROM SceneCharacter sc
      JOIN Scene s ON sc.scene_id = s.id
      WHERE sc.character_id = ?;
    `;
    const sceneParams = [characterId];
    const connectedScenes = queryDB(sceneQuery, sceneParams);
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

export function createNewCharacter(storyId: number, name: string, role: string, physicalDescription: string, personality: string, backstory: string, additionalNotes: string, relationships: any[], connectedPlotPointIds: number[], connectedSceneIds: number[]): any {
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
    relationships.forEach((relationship) => {
      const { id: relatedCharacterId, description } = relationship;
      const relationshipQuery = `
        INSERT INTO CharacterRelationship (character_id, related_character_id, description)
        VALUES (?, ?, ?);
      `;
      const relationshipParams = [characterId, relatedCharacterId, description];
      updateDB(relationshipQuery, relationshipParams);
    });
    // Connect plot points
    connectedPlotPointIds.forEach((plotPointId) => {
      const plotPointQuery = `
        INSERT INTO CharacterPlotPoint (character_id, plot_point_id)
        VALUES (?, ?);
      `;
      const plotPointParams = [characterId, plotPointId];
      updateDB(plotPointQuery, plotPointParams);
    });
    // Connect scenes
    connectedSceneIds.forEach((sceneId) => {
      const sceneQuery = `
        INSERT INTO CharacterScene (character_id, scene_id)
        VALUES (?, ?);
      `;
      const sceneParams = [characterId, sceneId];
      updateDB(sceneQuery, sceneParams);
    });
    container["characterId"] = characterId;
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