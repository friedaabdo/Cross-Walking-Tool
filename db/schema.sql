-- Active: 1777979788876@@127.0.0.1@3306@mysql
CREATE DATABASE IF NOT EXISTS cross_walking_tool;
USE cross_walking_tool;

-- 1. Create CUNY_School table
CREATE TABLE CUNY_School (
    school_id INT AUTO_INCREMENT PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    school_code VARCHAR(50) NOT NULL
);

-- 2. Create Department table (references CUNY_School)
CREATE TABLE Department (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT,
    department_code VARCHAR(50) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (school_id) REFERENCES CUNY_School(school_id)
);

-- 3. Create Users table (references Department)
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES Department(department_id)
);

-- 4. Create CUNY_Course table (references Department and Users)
CREATE TABLE CUNY_Course (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    syllabus_file_names VARCHAR(255),
    syllabus_file_url VARCHAR(255),
    last_edited TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES Department(department_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- 5. Create Learning_Experience table (references Users)
CREATE TABLE Learning_Experience (
    experience_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    link VARCHAR(255),
    last_edited TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- 6. Create Outcome table (references CUNY_Course and Learning_Experience)
CREATE TABLE Outcome (
    outcome_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    experience_id INT,
    outcome_text TEXT NOT NULL,
    category VARCHAR(100),
    FOREIGN KEY (course_id) REFERENCES CUNY_Course(course_id),
    FOREIGN KEY (experience_id) REFERENCES Learning_Experience(experience_id)
);

-- 7. Create Tag table
CREATE TABLE Tag (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(100) NOT NULL,
    category VARCHAR(100)
);

-- 8. Create Tag_Mapping table (references Tag, CUNY_Course, and Learning_Experience)
CREATE TABLE Tag_Mapping (
    mapping_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_id INT,
    course_id INT,
    experience_id INT,
    FOREIGN KEY (tag_id) REFERENCES Tag(tag_id),
    FOREIGN KEY (course_id) REFERENCES CUNY_Course(course_id),
    FOREIGN KEY (experience_id) REFERENCES Learning_Experience(experience_id)
);

-- 9. Create Matches table (references CUNY_Course and Learning_Experience)
CREATE TABLE Matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    experience_id INT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_edited TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    official_match BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (course_id) REFERENCES CUNY_Course(course_id),
    FOREIGN KEY (experience_id) REFERENCES Learning_Experience(experience_id)
);

-- 10. Create Match_Outcome_Details table (references Matches and Outcome)
CREATE TABLE Match_Outcome_Details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT,
    cuny_outcome_id INT,
    experience_outcome_id INT,
    matched BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (match_id) REFERENCES Matches(match_id),
    FOREIGN KEY (cuny_outcome_id) REFERENCES Outcome(outcome_id),
    FOREIGN KEY (experience_outcome_id) REFERENCES Outcome(outcome_id)
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJRRRRREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE    sxc56DRRDN R. NNNNNNNNNNNN\,.FT7