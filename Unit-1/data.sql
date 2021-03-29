CREATE TABLE teams (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY key_team (name)
);

INSERT INTO teams VALUES(1, 'Frontend');
INSERT INTO teams VALUES(2, 'Backend');
INSERT INTO teams VALUES(3, 'Design');
INSERT INTO teams VALUES(4, 'Foo Bar');

CREATE TABLE members (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  team_id int NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT member_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE
);

INSERT INTO members(name, team_id) 
  SELECT 'Frontender #1', (SELECT id FROM teams WHERE name='Frontend');
-- INSERT INTO members(name, team_id) VALUES('Frontender #1', 1);
INSERT INTO members(name, team_id) 
  SELECT 'Frontender #2', (SELECT id FROM teams WHERE name='Frontend');
INSERT INTO members(name, team_id) 
  SELECT 'Backender #1', (SELECT id FROM teams WHERE name='Backend');
INSERT INTO members(name, team_id) 
  SELECT 'Backender #2', (SELECT id FROM teams WHERE name='Backend');
INSERT INTO members(name, team_id) 
  SELECT 'Backender #3', (SELECT id FROM teams WHERE name='Backend');
INSERT INTO members(name, team_id) 
  SELECT 'Designer', (SELECT id FROM teams WHERE name='Design');
