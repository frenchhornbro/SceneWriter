PRAGMA foreign_keys = ON;

CREATE TABLE Story (
  id BIGINT PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  overview TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PlotPoint (
  id BIGINT PRIMARY KEY AUTOINCREMENT,
  story_id BIGINT NOT NULL,
  title VARCHAR(255),
  description TEXT NOT NULL,
  FOREIGN KEY (story_id) REFERENCES Story(id) ON DELETE CASCADE
);

CREATE TABLE Character (
  id BIGINT PRIMARY KEY AUTOINCREMENT,
  story_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  physical_description TEXT,
  personality TEXT,
  backstory TEXT,
  additional_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES Story(id) ON DELETE CASCADE
);

CREATE TABLE Scene (
  id BIGINT,
  version SMALLINT NOT NULL DEFAULT 1,
  story_id BIGINT NOT NULL,
  scene_text TEXT NOT NULL,
  overview TEXT,
  order SMALLINT NOT NULL,
  chapter_number SMALLINT,
  title VARCHAR(255),
  pov VARCHAR(255),
  location VARCHAR(255),
  tone TEXT,
  additional_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, version),
  FOREIGN KEY (story_id) REFERENCES Story(id) ON DELETE CASCADE
);

CREATE TABLE WritingStyleSample (
  id BIGINT PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255),
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE CharacterRelationship (
  character_id BIGINT NOT NULL,
  related_character_id BIGINT NOT NULL,
  description TEXT,
  PRIMARY KEY (character_id, related_character_id),
  FOREIGN KEY (character_id) REFERENCES Character(id) ON DELETE CASCADE,
  FOREIGN KEY (related_character_id) REFERENCES Character(id) ON DELETE CASCADE
);

CREATE TABLE SceneCharacter (
  scene_id BIGINT NOT NULL,
  scene_version SMALLINT NOT NULL,
  character_id BIGINT NOT NULL,
  PRIMARY KEY (scene_id, scene_version, character_id),
  FOREIGN KEY (scene_id, scene_version) REFERENCES Scene(id, version) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES Character(id) ON DELETE CASCADE
);

CREATE TABLE ScenePlotPoint (
  scene_id BIGINT NOT NULL,
  scene_version SMALLINT NOT NULL,
  plot_point_id BIGINT NOT NULL,
  PRIMARY KEY (scene_id, scene_version, plot_point_id),
  FOREIGN KEY (scene_id, scene_version) REFERENCES Scene(id, version) ON DELETE CASCADE,
  FOREIGN KEY (plot_point_id) REFERENCES PlotPoint(id) ON DELETE CASCADE
);