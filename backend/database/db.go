package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

var DB *sql.DB

func ConnectDatabase() {
	// Load environment variables from the .env file
	err2 := godotenv.Load()
	if err2 != nil {
		log.Fatal("Error loading .env file")
	}

	// Replace with your database details
	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	fmt.Println(dbUser)
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", dbUser, dbPassword, dbHost, dbName)

	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Error connecting to the database:", err)
	}

	// Test connection
	err = DB.Ping()
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}

	fmt.Println("Database connected successfully!")
}

func InitializeDatabase() {
	// Create a `users` table
	usersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INT AUTO_INCREMENT PRIMARY KEY,
		username VARCHAR(255) NOT NULL UNIQUE
	);`
	if _, err := DB.Exec(usersTable); err != nil {
		log.Fatalf("Failed to create users table: %v", err)
	}

	// Create a `threads` table
	threadsTable := `
	CREATE TABLE IF NOT EXISTS threads (
		id INT AUTO_INCREMENT PRIMARY KEY,
		title VARCHAR(255) NOT NULL,
		content TEXT NOT NULL,
		user_id INT NOT NULL,
		FOREIGN KEY (user_id) REFERENCES users(id)
	);`
	if _, err := DB.Exec(threadsTable); err != nil {
		log.Fatalf("Failed to create threads table: %v", err)
	}

	// Create a `categories` table
	categoriesTable := `
	CREATE TABLE IF NOT EXISTS categories (
		id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(255) NOT NULL UNIQUE
	);`
	if _, err := DB.Exec(categoriesTable); err != nil {
		log.Fatalf("Failed to create categories table: %v", err)
	}

	// Insert default user
	defaultUser := `
	INSERT IGNORE INTO users (username) VALUES ('admin'), ('guest'), ('moderator');`
	if _, err := DB.Exec(defaultUser); err != nil {
		log.Fatalf("Failed to insert default users: %v", err)
	}

	// Insert default categories
	defaultCategories := `
	INSERT IGNORE INTO categories (name) VALUES ('General'), ('Announcements'), ('FeedBack');`
	if _, err := DB.Exec(defaultCategories); err != nil {
		log.Fatalf("Failed to insert default categories: %v", err)
	}

	// Insert default threads
	defaultThreads := `
	INSERT IGNORE INTO threads (title, content, user_id)
	VALUES
	('Welcome to the Forum!', 'This is the first post. Feel free to discuss anything here.', 1),
	('Forum Guidelines', 'Please read and follow the forum rules to ensure a great experience for everyone.', 1);`
	if _, err := DB.Exec(defaultThreads); err != nil {
		log.Fatalf("Failed to insert default threads: %v", err)
	}

	fmt.Println("Database initialization complete!")
}
