package main

import (
	"database/sql"
	"forum-app/database"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

func main() {
	database.ConnectDatabase()
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// User Login Route
	r.POST("/login", func(c *gin.Context) {
		var user struct {
			Username string `json:"username"`
		}
		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		// Check if user exists
		var id int
		err := database.DB.QueryRow("SELECT id FROM users WHERE username = ?", user.Username).Scan(&id)
		if err == sql.ErrNoRows {
			// Create user if not exists
			res, err := database.DB.Exec("INSERT INTO users (username) VALUES (?)", user.Username)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
				return
			}
			id64, _ := res.LastInsertId()
			id = int(id64)
		}

		c.JSON(http.StatusOK, gin.H{"userId": id})
	})

	// Get All Threads
	r.GET("/threads", func(c *gin.Context) {
		rows, err := database.DB.Query("SELECT id, title, content, user_id FROM threads")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch threads"})
			return
		}
		defer rows.Close()

		var threads []map[string]interface{}
		for rows.Next() {
			var id, userId int
			var title, content string
			rows.Scan(&id, &title, &content, &userId)
			threads = append(threads, gin.H{"id": id, "title": title, "content": content, "userId": userId})
		}
		c.JSON(http.StatusOK, threads)
	})

	// Create a Thread
	r.POST("/threads", func(c *gin.Context) {
		var thread struct {
			Title   string `json:"title"`
			Content string `json:"content"`
			UserID  int    `json:"userId"`
		}
		if err := c.BindJSON(&thread); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		_, err := database.DB.Exec("INSERT INTO threads (title, content, user_id) VALUES (?, ?, ?)", thread.Title, thread.Content, thread.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create thread"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Thread created successfully"})
	})

	// Edit a Thread
	r.PUT("/threads/:id", func(c *gin.Context) {
		id := c.Param("id")
		var thread struct {
			Title   string `json:"newTitle"`
			Content string `json:"newContent"`
			UserID  int    `json:"userId"`
		}
		if err := c.BindJSON(&thread); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		// Check if user owns the thread
		var dbUserID int
		err := database.DB.QueryRow("SELECT user_id FROM threads WHERE id = ?", id).Scan(&dbUserID)
		if err != nil || dbUserID != thread.UserID {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		_, err = database.DB.Exec("UPDATE threads SET title = ?, content = ? WHERE id = ?", thread.Title, thread.Content, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update thread"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Thread updated successfully"})
	})

	r.Run(":8080")
}
