"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  Edit,
  Trash,
  Save,
  X,
  Tag,
  FileText,
  Calendar,
  Hash,
  Highlighter,
  Download,
  Upload,
  BookOpen,
} from "lucide-react";
import type {
  Note,
  Highlight as HighlightType,
  UploadedFile,
} from "@/lib/types";

interface EnhancedNotesViewProps {
  uploadedFiles: UploadedFile[];
}

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#fef08a", class: "bg-yellow-200" },
  { name: "Green", value: "#bbf7d0", class: "bg-green-200" },
  { name: "Blue", value: "#bfdbfe", class: "bg-blue-200" },
  { name: "Pink", value: "#fce7f3", class: "bg-pink-200" },
  { name: "Purple", value: "#e9d5ff", class: "bg-purple-200" },
];

export function EnhancedNotesView({ uploadedFiles }: EnhancedNotesViewProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("studyverse-notes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage when notes change
  useEffect(() => {
    localStorage.setItem("studyverse-notes", JSON.stringify(notes));
  }, [notes]);

  const createNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note: Note = {
      id: `note-${Date.now()}`,
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      highlights: [],
    };

    setNotes((prev) => [note, ...prev]);
    setNewNote({ title: "", content: "", tags: [] });
    setIsCreating(false);
  };

  const updateNote = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === updatedNote.id
          ? { ...updatedNote, updatedAt: new Date() }
          : note
      )
    );
    setEditingNote(null);
  };

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  const addTag = (tag: string) => {
    if (!tag.trim()) return;

    if (isCreating) {
      setNewNote((prev) => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
    } else if (editingNote) {
      setEditingNote((prev) =>
        prev
          ? {
              ...prev,
              tags: [...prev.tags, tag.trim()],
            }
          : null
      );
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    if (isCreating) {
      setNewNote((prev) => ({
        ...prev,
        tags: prev.tags.filter((tag) => tag !== tagToRemove),
      }));
    } else if (editingNote) {
      setEditingNote((prev) =>
        prev
          ? {
              ...prev,
              tags: prev.tags.filter((tag) => tag !== tagToRemove),
            }
          : null
      );
    }
  };

  const addHighlight = (noteId: string, text: string, color: string) => {
    const highlight: HighlightType = {
      id: `highlight-${Date.now()}`,
      text,
      position: { start: 0, end: text.length },
      color,
    };

    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? { ...note, highlights: [...note.highlights, highlight] }
          : note
      )
    );
  };

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `studyverse-notes-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const importNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedNotes = JSON.parse(e.target?.result as string);
        setNotes((prev) => [...importedNotes, ...prev]);
      } catch (error) {
        console.error("Error importing notes:", error);
      }
    };
    reader.readAsText(file);
  };

  // Filter notes based on search and tags
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => note.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)));

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50 border-purple-500/30 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              Study Notes ({notes.length})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportNotes}
                disabled={notes.length === 0}
                className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all duration-300 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("import-notes")?.click()}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all duration-300"
              >
                <Upload className="w-4 h-4 mr-1" />
                Import
              </Button>
              <input
                id="import-notes"
                type="file"
                accept=".json"
                onChange={importNotes}
                className="hidden"
              />
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-1" />
                New Note
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Filter by tags:</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        selectedTags.includes(tag) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag)
                            ? prev.filter((t) => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create New Note */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Create New Note</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreating(false);
                      setNewNote({ title: "", content: "", tags: [] });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Note title..."
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
                <Textarea
                  placeholder="Write your notes here..."
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote((prev) => ({ ...prev, content: e.target.value }))
                  }
                  rows={6}
                />

                {/* Tags Input */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tags..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => addTag(tagInput)}
                      disabled={!tagInput.trim()}
                    >
                      <Hash className="w-4 h-4" />
                    </Button>
                  </div>

                  {newNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newNote.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                        >
                          {tag}
                          <X
                            className="w-3 h-3 ml-1"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={createNote}>
                    <Save className="w-4 h-4 mr-1" />
                    Save Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                  {notes.length === 0
                    ? "No notes yet"
                    : "No notes match your search"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {notes.length === 0
                    ? "Create your first note to get started"
                    : "Try adjusting your search or filters"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{note.title}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingNote(note)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {formatDate(note.createdAt)}</span>
                      </div>
                      {note.updatedAt.getTime() !==
                        note.createdAt.getTime() && (
                        <span>Updated: {formatDate(note.updatedAt)}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>

                      {/* Tags */}
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {note.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Highlights */}
                      {note.highlights.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Highlighter className="w-4 h-4" />
                            Highlights ({note.highlights.length})
                          </p>
                          <div className="space-y-2">
                            {note.highlights.map((highlight) => (
                              <div
                                key={highlight.id}
                                className={`p-2 rounded text-xs border ${
                                  HIGHLIGHT_COLORS.find(
                                    (c) => c.value === highlight.color
                                  )?.class || "bg-yellow-200"
                                }`}
                              >
                                "{highlight.text}"
                                {highlight.note && (
                                  <p className="text-muted-foreground mt-1">
                                    Note: {highlight.note}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Edit Note Modal */}
      <AnimatePresence>
        {editingNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Edit Note</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingNote(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={editingNote.title}
                    onChange={(e) =>
                      setEditingNote((prev) =>
                        prev ? { ...prev, title: e.target.value } : null
                      )
                    }
                  />
                  <Textarea
                    value={editingNote.content}
                    onChange={(e) =>
                      setEditingNote((prev) =>
                        prev ? { ...prev, content: e.target.value } : null
                      )
                    }
                    rows={8}
                  />

                  {/* Tags Input */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tags..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag(tagInput);
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => addTag(tagInput)}
                        disabled={!tagInput.trim()}
                      >
                        <Hash className="w-4 h-4" />
                      </Button>
                    </div>

                    {editingNote.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {editingNote.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                          >
                            {tag}
                            <X
                              className="w-3 h-3 ml-1"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingNote(null)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => updateNote(editingNote)}>
                      <Save className="w-4 h-4 mr-1" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
