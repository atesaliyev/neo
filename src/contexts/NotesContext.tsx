import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface NotesContextType {
  notes: Note[];
  addNote: (content: string, userId: string) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (content: string, userId: string) => {
    const newNote: Note = {
      id: uuidv4(),
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (id: string, content: string) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, content, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  return (
    <NotesContext.Provider value={{
      notes,
      addNote,
      updateNote,
      deleteNote
    }}>
      {children}
    </NotesContext.Provider>
  );
};