package main

import (
	"encoding/json"
	"io"
	"log"
	"log/slog"
	"net/http"
	"os"
)

type Data struct {
	Path        string                 `json:"path"`
	EditorState map[string]interface{} `json:"editorState"`
}

func save(w http.ResponseWriter, r *http.Request) {

	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		slog.Error("unable to read request body", "error", err)
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close() // Close the body after reading
	var data Data
	err = json.Unmarshal(body, &data)
	if err != nil {
		slog.Error("unable to decode json body", "error", err, "body", string(body))
		http.Error(w, "Failed to decode json body", http.StatusBadRequest)
		return
	}

	err = os.WriteFile(data.Path, body, 0644)
	if err != nil {
		slog.Error("unable to write file", "error", err)
		http.Error(w, "Failed to write file", http.StatusBadRequest)
		return
	}

	// Respond to the client
	w.WriteHeader(http.StatusOK)
}

func main() {
	fs := http.FileServer(http.Dir("./src"))
	http.Handle("/", fs)

	log.Print("Listening on :3000...")
	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
