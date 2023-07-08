import Note from './components/Note'
import { useState, useEffect } from 'react'
import noteService from './services/notes'
import Notification from './components/Notification'
import Footer from './components/Footer'

const App = () => {
    const [notes, setNotes] = useState([])
    const [newNote, setNewNote] = useState('')
    const [showAll, setShowAll] = useState(true)
    const [errorMessage, setErrorMessage] = useState(null)

    const hook = () => {
        noteService.getAll()
            .then(initialNotes => {
                setNotes(initialNotes)
            })
    }

    useEffect(hook, [])
    if (!notes) {
        return null
    }

    const toggleImportanceOf = (id) => {
        const note = notes.find(n => n.id === id)
        const changedNote = {...note, important: !note.important}

        noteService
            .update(id, changedNote)
            .then(returnedNote => {
                console.log(returnedNote)
                setNotes(notes.map(note => note.id !== id ? note : returnedNote))
            })
            .catch(error => {
                setErrorMessage(
                    `Note '${note.content}' was already removed from server`
                )
                setTimeout(() => {
                    setErrorMessage(null)
                }, 5000)
                setNotes(notes.filter(n => n.id !== id))
            })
    }

    const notesToShow = showAll
        ? notes
        : notes.filter(note => note.important)

    const addNote = (event) => {
        event.preventDefault()
        const noteObject = {
            content: newNote,
            important: Math.random() < 0.5,
        }

        noteService
            .create(noteObject)
            .then(returnedNote => {
                setNotes(notes.concat(returnedNote))
                setNewNote('')
            })
    }

    const handleNoteChange = (event) => {
        setNewNote(event.target.value)
    }

    return (
        <div>
            <h1>Notes</h1>
            <Notification message={errorMessage}/>
            <div>
                <button onClick={() => setShowAll(!showAll)}>
                    show {showAll ? 'important' : 'all'}
                </button>
            </div>
            <ul>
                {notesToShow.map(note =>
                <Note
                    key={note.id}
                    note={note}
                    toggleImportance={() => toggleImportanceOf(note.id)}
                />)}
            </ul>
            <form onSubmit={addNote}>
                <input
                    value={newNote}
                    onChange={handleNoteChange}/>
                <button type="submit">save</button>
            </form>
            <Footer />
        </div>
    )

    // return (
    //     <div>
    //         <h1>Notes</h1>
    //             <ul>
    //                 {notes.map(note =>
    //                     <Note key={note.id} note={note} />
    //                 )}
    //             </ul>
    //         <form onSubmit={addNote}>
    //             <input
    //                 value={newNote}
    //                 onChange={handleNoteChange}/>
    //             <button type="submit">save</button>
    //         </form>
    //     </div>
    // )
}

export default App