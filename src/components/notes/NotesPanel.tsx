import { useState } from 'react';
import { StickyNote, Plus, Trash2, Save } from 'lucide-react';
import { useNotes } from '../../contexts/NotesContext';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const NotesPanel = () => {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const userNotes = notes.filter(note => note.userId === user?.id);

  const handleAddNote = () => {
    if (!newNote.trim() || !user) return;
    addNote(newNote, user.id);
    setNewNote('');
  };

  const handleUpdateNote = (id: string) => {
    if (!editContent.trim()) return;
    updateNote(id, editContent);
    setEditingNote(null);
    setEditContent('');
  };

  const startEditing = (note: { id: string; content: string }) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-3 shadow-lg"
      >
        <StickyNote size={24} />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notlarım</h3>
          </div>

          <div className="p-4">
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Yeni not ekle..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {userNotes.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Henüz not eklenmemiş
                </div>
              ) : (
                userNotes.map(note => (
                  <div
                    key={note.id}
                    className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                  >
                    {editingNote === note.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingNote(null)}
                            className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800"
                          >
                            İptal
                          </button>
                          <button
                            onClick={() => handleUpdateNote(note.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                          >
                            <Save size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            {format(new Date(note.updatedAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEditing(note)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPanel;