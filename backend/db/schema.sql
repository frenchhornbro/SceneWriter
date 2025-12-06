PRAGMA foreign_keys = ON;

CREATE TABLE Story (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
  overview TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PlotPoint (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER NOT NULL,
  title TEXT,
  description TEXT NOT NULL,
  FOREIGN KEY (story_id) REFERENCES Story(id) ON DELETE CASCADE
);

CREATE TABLE Character (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  physical_description TEXT,
  personality TEXT,
  backstory TEXT,
  additional_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES Story(id) ON DELETE CASCADE
);

CREATE TABLE Scene (
  id INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  story_id INTEGER NOT NULL,
  scene_text TEXT NOT NULL,
  overview TEXT,
  scene_order INTEGER NOT NULL,
  chapter_number INTEGER,
  title TEXT,
  pov TEXT,
  location TEXT,
  tone TEXT,
  additional_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, version),
  FOREIGN KEY (story_id) REFERENCES Story(id) ON DELETE CASCADE
);

CREATE TABLE WritingStyleSample (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE CharacterRelationship (
  character_id INTEGER NOT NULL,
  related_character_id INTEGER NOT NULL,
  description TEXT,
  PRIMARY KEY (character_id, related_character_id),
  FOREIGN KEY (character_id) REFERENCES Character(id) ON DELETE CASCADE,
  FOREIGN KEY (related_character_id) REFERENCES Character(id) ON DELETE CASCADE
);

CREATE TABLE SceneCharacter (
  scene_id INTEGER NOT NULL,
  scene_version INTEGER NOT NULL,
  character_id INTEGER NOT NULL,
  PRIMARY KEY (scene_id, scene_version, character_id),
  FOREIGN KEY (scene_id, scene_version) REFERENCES Scene(id, version) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES Character(id) ON DELETE CASCADE
);

CREATE TABLE ScenePlotPoint (
  scene_id INTEGER NOT NULL,
  scene_version INTEGER NOT NULL,
  plot_point_id INTEGER NOT NULL,
  PRIMARY KEY (scene_id, scene_version, plot_point_id),
  FOREIGN KEY (scene_id, scene_version) REFERENCES Scene(id, version) ON DELETE CASCADE,
  FOREIGN KEY (plot_point_id) REFERENCES PlotPoint(id) ON DELETE CASCADE
);