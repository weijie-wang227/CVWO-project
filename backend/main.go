package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"forum-app/database"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to the database
	database.ConnectDatabase()

	// Initialize router
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Adjust based on your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Sample endpoint to fetch threads
	r.GET("/threads", func(c *gin.Context) {
		rows, err := database.DB.Query("SELECT id, title, content FROM threads")
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch threads"})
			return
		}
		defer rows.Close()

		var threads []map[string]interface{}
		for rows.Next() {
			var id int
			var title, content string
			rows.Scan(&id, &title, &content)
			threads = append(threads, gin.H{"id": id, "title": title, "content": content})
		}

		c.JSON(http.StatusOK, threads)
	})

	// Endpoint to create a new thread
	r.POST("/threads", func(c *gin.Context) {
		var newThread struct {
			Title   string `json:"title"`
			Content string `json:"content"`
		}

		if err := c.BindJSON(&newThread); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		result, err := database.DB.Exec("INSERT INTO threads (title, content) VALUES (?, ?)", newThread.Title, newThread.Content)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create thread"})
			return
		}

		id, _ := result.LastInsertId()
		c.JSON(http.StatusCreated, gin.H{"id": id, "title": newThread.Title, "content": newThread.Content})
	})

	// Fetch comments for a thread
	r.GET("/threads/:id/comments", func(c *gin.Context) {
		threadID := c.Param("id")

		rows, err := database.DB.Query("SELECT id, content FROM comments WHERE thread_id = ?", threadID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
			return
		}
		defer rows.Close()

		var comments []map[string]interface{}
		for rows.Next() {
			var id int
			var content string
			rows.Scan(&id, &content)
			comments = append(comments, gin.H{"id": id, "content": content})
		}
		c.JSON(http.StatusOK, comments)
	})

	// Add comment to a thread
	r.POST("/threads/:id/comments", func(c *gin.Context) {
		threadID := c.Param("id")
		var newComment struct {
			Content string `json:"content"`
		}
		if err := c.ShouldBindJSON(&newComment); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		_, err := database.DB.Exec("INSERT INTO comments (thread_id, content) VALUES (?, ?)", threadID, newComment.Content)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add comment"})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Comment added"})
	})
	// Fetch thread by ID
	r.GET("/threads/:id", func(c *gin.Context) {
		threadID := c.Param("id")

		var title, content string
		err := database.DB.QueryRow("SELECT title, content FROM threads WHERE id = ?", threadID).Scan(&title, &content)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Thread not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch thread"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"title": title, "content": content})
	})

	// Start server
	err := r.Run(":8080")
	if err != nil {
		log.Fatal("Server failed to start:", err)
	}
	fmt.Println("Server running at http://localhost:8080")
}
