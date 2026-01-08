import { scenePreview } from "@shared/templates/scene";
import { errorHandlerWrapper, transactionWrapper } from "./dataAccessUtils";
import { queryDB, updateDB } from "./dbOperations";

export function getPlotPoint(plotPointId: number): any {
  return transactionWrapper("getPlotPoint", (container) => {
    // Get plot point
    const plotPointQuery = `
      SELECT * FROM PlotPoint WHERE id = ?;
    `;
    const plotPointParams = [plotPointId];
    const plotPoint = queryDB(plotPointQuery, plotPointParams)[0];
    container["plotPoint"] = plotPoint;
    // Get connected scenes
    const sceneQuery = `
      SELECT s.id, s.version, s.title, s.scene_text, s.scene_order, s.overview, s.created_at, s.edited_at
      FROM ScenePlotPoint spp
      JOIN Scene s ON spp.scene_id = s.id AND spp.scene_version = s.version
      WHERE spp.plot_point_id = ?;
    `;
    const sceneParams = [plotPointId];
    const connectedScenes: scenePreview[] = queryDB(sceneQuery, sceneParams);
    container["connectedScenes"] = connectedScenes;
    // Get connected characters
    const characterQuery = `
      SELECT c.id, c.name
      FROM CharacterPlotPoint cpp
      JOIN Character c ON cpp.character_id = c.id
      WHERE cpp.plot_point_id = ?;
    `;
    const characterParams = [plotPointId];
    const connectedCharacters = queryDB(characterQuery, characterParams);
    container["connectedCharacters"] = connectedCharacters;
  });
}

export function getAllPlotPoints(storyId: number): any[] {
  return errorHandlerWrapper("getAllPlotPoints", () => {
    const query = `
      SELECT id, title, description, created_at AS createdAt, edited_at AS editedAt FROM PlotPoint WHERE story_id = ? ORDER BY edited_at DESC;
    `;
    const params = [storyId];
    const result = queryDB(query, params);
    return result;
  });
}

export function createNewPlotPoint(storyId: number, title: string, description: string, connectedScenes: scenePreview[], connectedCharacterIds: number[]): any {
  return transactionWrapper("createNewPlotPoint", (container) => {
    // Create plot point
    const createQuery = `
      INSERT INTO PlotPoint (story_id, title, description)
      VALUES (?, ?, ?);
    `;
    const createParams = [storyId, title, description];
    const result = updateDB(createQuery, createParams);
    const plotPointId = result.lastInsertRowid;
    container["plotPointId"] = plotPointId;
    // Connect scenes
    if (connectedScenes.length > 0) {
      const sceneQuery = `
        INSERT INTO ScenePlotPoint (plot_point_id, scene_id, scene_version)
        VALUES ${connectedScenes.map(() => "(?, ?, ?)").join(", ")};
      `;
      const sceneParams = connectedScenes.flatMap((scene: scenePreview) => [plotPointId, scene.id, scene.version]);
      updateDB(sceneQuery, sceneParams);
    }
    // Connect characters
    if (connectedCharacterIds.length > 0) {
      const characterQuery = `
        INSERT INTO CharacterPlotPoint (plot_point_id, character_id)
        VALUES ${connectedCharacterIds.map(() => "(?, ?)").join(", ")};
      `;
      const characterParams = connectedCharacterIds.flatMap((characterId) => [plotPointId, characterId]);
      updateDB(characterQuery, characterParams);
    }
  });
}

export function updatePlotPoint(plotPointId: number, title: string, description: string, connectedScenes: scenePreview[], connectedCharacterIds: number[]): void {
  function processConnectedCharacters() {
    if (connectedCharacterIds.length > 0) {
      // Delete old characters
      const deleteCharactersPrompt = `
        DELETE FROM CharacterPlotPoint
        WHERE plot_point_id = ?
        AND character_id NOT IN (${connectedCharacterIds.map(() => "?").join(", ")});
      `;
      const deleteCharactersParams = [plotPointId, ...connectedCharacterIds];
      updateDB(deleteCharactersPrompt, deleteCharactersParams);
      // Add new characters
      const newCharactersPrompt = `
        INSERT INTO CharacterPlotPoint (plot_point_id, character_id)
        VALUES ${connectedCharacterIds.map(() => "(?, ?)").join(", ")}
        ON CONFLICT(plot_point_id, character_id) DO NOTHING;
      `;
      const newCharactersParams = connectedCharacterIds.flatMap((characterId: any) => [plotPointId, characterId]);
      updateDB(newCharactersPrompt, newCharactersParams);
    } else {
      // Delete all characters when array is empty
      const deleteAllCharactersPrompt = `
        DELETE FROM CharacterPlotPoint
        WHERE plot_point_id = ?;
      `;
      updateDB(deleteAllCharactersPrompt, [plotPointId]);
    }
  }

  function processConnectedScenes() {
    if (connectedScenes.length > 0) {
      // Delete old scenes
      const deleteScenesPrompt = `
        DELETE FROM ScenePlotPoint
        WHERE plot_point_id = ?
        AND (scene_id, scene_version) NOT IN (${connectedScenes.map(() => "(?, ?)").join(", ")});
      `;
      const deleteScenesParams = [plotPointId, ...connectedScenes.flatMap((scene: scenePreview) => [scene.id, scene.version])];
      updateDB(deleteScenesPrompt, deleteScenesParams);
      // Add new scenes
      const newScenesPrompt = `
        INSERT INTO ScenePlotPoint (plot_point_id, scene_id, scene_version)
        VALUES ${connectedScenes.map(() => "(?, ?, ?)").join(", ")}
        ON CONFLICT(plot_point_id, scene_id, scene_version) DO NOTHING;
      `;
      const newScenesParams = connectedScenes.flatMap((scene: scenePreview) => [plotPointId, scene.id, scene.version]);
      updateDB(newScenesPrompt, newScenesParams);
    } else {
      // Delete all scenes when array is empty
      const deleteAllScenesPrompt = `
        DELETE FROM ScenePlotPoint
        WHERE plot_point_id = ?;
      `;
      updateDB(deleteAllScenesPrompt, [plotPointId]);
    }
  }

  return transactionWrapper("updatePlotPoint", (_) => {
    // Update plot point
    const plotPointQuery = `
      UPDATE PlotPoint
      SET title = ?, description = ?, edited_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;
    const plotPointParams = [title, description, plotPointId];
    updateDB(plotPointQuery, plotPointParams);
    processConnectedCharacters();
    processConnectedScenes();
  });
}

export function deletePlotPoint(plotPointId: number): void {
  return errorHandlerWrapper("deletePlotPoint", () => {
    const deleteQuery = `
      DELETE FROM PlotPoint WHERE id = ?;
    `;
    const deleteParams = [plotPointId];
    updateDB(deleteQuery, deleteParams);
  });
}