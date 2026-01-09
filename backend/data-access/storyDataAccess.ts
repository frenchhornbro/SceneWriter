import { errorHandlerWrapper, transactionWrapper } from "./dataAccessUtils";
import { queryDB, updateDB } from "./dbOperations";

export function getStory(storyId: number): any {
  return errorHandlerWrapper("getStory", () => {
    const query = `
      SELECT * FROM Story WHERE id = ?;
    `;
    const params = [storyId];
    const result = queryDB(query, params)[0];
    return result;
  });
}

export function getAllStories(): any[] {
  return errorHandlerWrapper("getAllStories", () => {
    const query = `
      SELECT id, title, subtitle, overview, created_at AS createdAt, edited_at AS editedAt FROM Story ORDER BY edited_at DESC;
    `;
    const params: any[] = [];
    const result = queryDB(query, params);
    return result;
  });
}

export function createNewStory(title: string, subtitle: string, overview: string): any {
  return errorHandlerWrapper("createNewStory", () => {
    const createQuery = `
      INSERT INTO Story (title, subtitle, overview)
      VALUES (?, ?, ?);
    `;
    const createParams = [title, subtitle, overview];
    const result = updateDB(createQuery, createParams);
    const storyId = result.lastInsertRowid;
    return storyId;
  });
}

export function updateStory(storyId: number, title: string, subtitle: string, overview: string): void {
  return errorHandlerWrapper("updateStory", () => {
    const updateQuery = `
      UPDATE Story
      SET title = ?, subtitle = ?, overview = ?, edited_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;
    const updateParams = [title, subtitle, overview, storyId];
    updateDB(updateQuery, updateParams);
  });
}

export function deleteStory(storyId: number): void {
  return errorHandlerWrapper("deleteStory", () => {
    const deleteQuery = `
      DELETE FROM Story WHERE id = ?;
    `;
    const deleteParams = [storyId];
    updateDB(deleteQuery, deleteParams);
  });
}

export function getStoryForExport(storyId: number): any {
  return transactionWrapper("getStoryForExport", (container) => {
    // Get story details
    const storyQuery = `SELECT * FROM Story WHERE id = ?;`;
    const story = queryDB(storyQuery, [storyId])[0];
    if (!story) {
      return null;
    }

    // Get all characters with their relationships
    const charactersQuery = `
      SELECT * FROM Character WHERE story_id = ?;
    `;
    const characters = queryDB(charactersQuery, [storyId]);

    // Get character relationships
    const characterIds = characters.map((c: any) => c.id);
    let relationships: any[] = [];
    if (characterIds.length > 0) {
      const relationshipsQuery = `
        SELECT * FROM CharacterRelationship
        WHERE character_id IN (${characterIds.map(() => "?").join(", ")});
      `;
      relationships = queryDB(relationshipsQuery, characterIds);
    }

    // Get all plot points
    const plotPointsQuery = `
      SELECT * FROM PlotPoint WHERE story_id = ?;
    `;
    const plotPoints = queryDB(plotPointsQuery, [storyId]);

    // Get character-plotpoint connections
    let characterPlotPoints: any[] = [];
    if (characterIds.length > 0) {
      const characterPlotPointsQuery = `
        SELECT * FROM CharacterPlotPoint
        WHERE character_id IN (${characterIds.map(() => "?").join(", ")});
      `;
      characterPlotPoints = queryDB(characterPlotPointsQuery, characterIds);
    }

    // Get latest version of each scene (by scene_order)
    const scenesQuery = `
      SELECT s.*
      FROM Scene s
      INNER JOIN (
        SELECT id, MAX(version) AS max_version
        FROM Scene
        WHERE story_id = ?
        GROUP BY id
      ) latest ON s.id = latest.id AND s.version = latest.max_version
      ORDER BY s.scene_order ASC;
    `;
    const scenes = queryDB(scenesQuery, [storyId]);

    // Get scene-character and scene-plotpoint connections for latest versions
    const sceneConnections: any[] = [];
    for (const scene of scenes) {
      const sceneCharactersQuery = `
        SELECT * FROM SceneCharacter
        WHERE scene_id = ? AND scene_version = ?;
      `;
      const sceneCharacters = queryDB(sceneCharactersQuery, [scene.id, scene.version]);

      const scenePlotPointsQuery = `
        SELECT * FROM ScenePlotPoint
        WHERE scene_id = ? AND scene_version = ?;
      `;
      const scenePlotPoints = queryDB(scenePlotPointsQuery, [scene.id, scene.version]);

      sceneConnections.push({
        sceneId: scene.id,
        sceneVersion: scene.version,
        characterIds: sceneCharacters.map((sc: any) => sc.character_id),
        plotPointIds: scenePlotPoints.map((sp: any) => sp.plot_point_id),
      });
    }

    container["story"] = story;
    container["characters"] = characters;
    container["relationships"] = relationships;
    container["plotPoints"] = plotPoints;
    container["characterPlotPoints"] = characterPlotPoints;
    container["scenes"] = scenes;
    container["sceneConnections"] = sceneConnections;
  });
}

export function getScenesForTextExport(storyId: number): any[] {
  return errorHandlerWrapper("getScenesForTextExport", () => {
    const query = `
      SELECT s.title, s.scene_text
      FROM Scene s
      INNER JOIN (
        SELECT id, MAX(version) AS max_version
        FROM Scene
        WHERE story_id = ?
        GROUP BY id
      ) latest ON s.id = latest.id AND s.version = latest.max_version
      ORDER BY s.scene_order ASC;
    `;
    return queryDB(query, [storyId]);
  });
}

export function importStory(story: any, characters: any[], relationships: any[], plotPoints: any[], characterPlotPoints: any[], scenes: any[], sceneConnections: any[]): any {
  return transactionWrapper("importStory", (container) => {
    // Create the story
    const storyQuery = `
      INSERT INTO Story (title, subtitle, overview)
      VALUES (?, ?, ?);
    `;
    const storyResult = updateDB(storyQuery, [
      story.title,
      story.subtitle || "",
      story.overview || "",
    ]);
    const storyId = storyResult.lastInsertRowid;
    container["storyId"] = storyId;

    // Map old character IDs to new ones
    const characterIdMap = new Map<number, number>();

    // Create characters
    for (const character of characters || []) {
      const characterQuery = `
        INSERT INTO Character (story_id, name, role, physical_description, personality, backstory, additional_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `;
      const characterResult = updateDB(characterQuery, [
        storyId,
        character.name,
        character.role || "",
        character.physical_description || "",
        character.personality || "",
        character.backstory || "",
        character.additional_notes || "",
      ]);
      characterIdMap.set(character.id, Number(characterResult.lastInsertRowid));
    }

    // Create character relationships
    for (const rel of relationships || []) {
      const newCharacterId = characterIdMap.get(rel.character_id);
      const newRelatedId = characterIdMap.get(rel.related_character_id);
      if (newCharacterId && newRelatedId) {
        const relQuery = `
          INSERT INTO CharacterRelationship (character_id, related_character_id, description)
          VALUES (?, ?, ?);
        `;
        updateDB(relQuery, [newCharacterId, newRelatedId, rel.description || ""]);
      }
    }

    // Map old plot point IDs to new ones
    const plotPointIdMap = new Map<number, number>();

    // Create plot points
    for (const plotPoint of plotPoints || []) {
      const plotPointQuery = `
        INSERT INTO PlotPoint (story_id, title, description)
        VALUES (?, ?, ?);
      `;
      const plotPointResult = updateDB(plotPointQuery, [
        storyId,
        plotPoint.title,
        plotPoint.description || "",
      ]);
      plotPointIdMap.set(plotPoint.id, Number(plotPointResult.lastInsertRowid));
    }

    // Create character-plotpoint connections
    for (const cp of characterPlotPoints || []) {
      const newCharacterId = characterIdMap.get(cp.character_id);
      const newPlotPointId = plotPointIdMap.get(cp.plot_point_id);
      if (newCharacterId && newPlotPointId) {
        const cpQuery = `
          INSERT INTO CharacterPlotPoint (character_id, plot_point_id)
          VALUES (?, ?);
        `;
        updateDB(cpQuery, [newCharacterId, newPlotPointId]);
      }
    }

    // Map old scene IDs to new ones
    const sceneIdMap = new Map<number, number>();

    // Get next scene ID
    const sceneIdQuery = `SELECT COALESCE(MAX(id), 0) + 1 AS newId FROM Scene;`;
    let nextSceneId = queryDB(sceneIdQuery, [])[0]?.newId || 1;

    // Create scenes
    for (const scene of scenes || []) {
      const newSceneId = nextSceneId++;
      sceneIdMap.set(scene.id, newSceneId);

      const sceneQuery = `
        INSERT INTO Scene (story_id, id, version, overview, scene_text, scene_order, title, pov, location, tone, additional_notes, model)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
      updateDB(sceneQuery, [
        storyId,
        newSceneId,
        1, // Start at version 1 for imported scenes
        scene.overview || "",
        scene.scene_text || "",
        scene.scene_order,
        scene.title,
        scene.pov || "",
        scene.location || "",
        scene.tone || "",
        scene.additional_notes || "",
        scene.model || "",
      ]);
    }

    // Create scene connections
    for (const conn of sceneConnections || []) {
      const newSceneId = sceneIdMap.get(conn.scene_id);
      if (!newSceneId) continue;

      // Scene-character connections
      for (const oldCharId of conn.character_ids || []) {
        const newCharId = characterIdMap.get(oldCharId);
        if (newCharId) {
          const scQuery = `
            INSERT INTO SceneCharacter (scene_id, scene_version, character_id)
            VALUES (?, ?, ?);
          `;
          updateDB(scQuery, [newSceneId, 1, newCharId]);
        }
      }

      // Scene-plotpoint connections
      for (const oldPpId of conn.plot_point_ids || []) {
        const newPpId = plotPointIdMap.get(oldPpId);
        if (newPpId) {
          const spQuery = `
            INSERT INTO ScenePlotPoint (scene_id, scene_version, plot_point_id)
            VALUES (?, ?, ?);
          `;
          updateDB(spQuery, [newSceneId, 1, newPpId]);
        }
      }
    }
  });
}