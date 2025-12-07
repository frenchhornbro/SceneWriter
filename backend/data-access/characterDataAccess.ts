import { transactionWrapper } from "./dataAccessUtils";
import { updateDB } from "./dbOperations";

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