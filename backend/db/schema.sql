PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Story (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
  overview TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS PlotPoint (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES Story(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Character (
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

CREATE TABLE IF NOT EXISTS Scene (
  id INTEGER NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  story_id INTEGER NOT NULL,
  scene_text TEXT NOT NULL,
  overview TEXT,
  scene_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  pov TEXT,
  location TEXT,
  tone TEXT,
  additional_notes TEXT,
  model TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, version),
  FOREIGN KEY (story_id) REFERENCES Story(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS WritingStyleSample (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS CharacterRelationship (
  character_id INTEGER NOT NULL,
  related_character_id INTEGER NOT NULL,
  description TEXT,
  PRIMARY KEY (character_id, related_character_id),
  FOREIGN KEY (character_id) REFERENCES Character(id) ON DELETE CASCADE,
  FOREIGN KEY (related_character_id) REFERENCES Character(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS SceneCharacter (
  scene_id INTEGER NOT NULL,
  scene_version INTEGER NOT NULL,
  character_id INTEGER NOT NULL,
  PRIMARY KEY (scene_id, scene_version, character_id),
  FOREIGN KEY (scene_id, scene_version) REFERENCES Scene(id, version) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES Character(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ScenePlotPoint (
  scene_id INTEGER NOT NULL,
  scene_version INTEGER NOT NULL,
  plot_point_id INTEGER NOT NULL,
  PRIMARY KEY (scene_id, scene_version, plot_point_id),
  FOREIGN KEY (scene_id, scene_version) REFERENCES Scene(id, version) ON DELETE CASCADE,
  FOREIGN KEY (plot_point_id) REFERENCES PlotPoint(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CharacterPlotPoint (
  character_id INTEGER NOT NULL,
  plot_point_id INTEGER NOT NULL,
  PRIMARY KEY (character_id, plot_point_id),
  FOREIGN KEY (character_id) REFERENCES Character(id) ON DELETE CASCADE,
  FOREIGN KEY (plot_point_id) REFERENCES PlotPoint(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS SceneHighlight (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scene_id INTEGER NOT NULL,
  scene_version INTEGER NOT NULL,
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  exact_text TEXT NOT NULL,
  prefix_context TEXT NOT NULL,
  suffix_context TEXT NOT NULL,
  color TEXT NOT NULL,
  note TEXT,
  is_valid INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scene_id, scene_version) REFERENCES Scene(id, version) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS TextEdit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scene_id INTEGER NOT NULL,
  scene_version INTEGER NOT NULL,
  edit_position INTEGER NOT NULL,
  chars_inserted INTEGER NOT NULL,
  chars_deleted INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scene_id, scene_version) REFERENCES Scene(id, version) ON DELETE CASCADE
);