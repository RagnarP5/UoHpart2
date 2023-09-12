import Note from './components/Note'
import { useState, useEffect, useRef } from 'react'
import noteService from './services/notes'
import loginService from './services/login'
import Notification from './components/Notification'
import Footer from './components/Footer'
import LoginForm from "./components/LoginForm";
import Togglable from "./components/Togglable";
import NoteForm from "./components/NoteForm";

const App = () => {
    const [notes, setNotes] = useState([])
    const [showAll, setShowAll] = useState(true)
    const [errorMessage, setErrorMessage] = useState(null)
    const [username, setUsername] = useState('')
    const [user, setUser] = useState(null)
    const [password, setPassword] = useState('')
    // const [loginVisible, setLoginVisible] = useState(false)

    const hook = () => {
        noteService.getAll()
            .then(initialNotes => {
                setNotes(initialNotes)
            })
    }

    useEffect(hook, [])

    useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
        if (loggedUserJSON) {
            const user = JSON.parse(loggedUserJSON)
            setUser(user)
            noteService.setToken(user.token)
        } else {
            window.localStorage.clear()
            setUser(null)
        }
    }, [])

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

    const addNote = (noteObject) => {
        noteFormRef.current.toggleVisibility()
        noteService
            .create(noteObject)
            .then(returnedNote => {
                setNotes(notes.concat(returnedNote))
            })
    }

    const handleLogin = async (event) => {
        event.preventDefault()

        try {
            const user = await loginService.login({
                username, password
            })

            window.localStorage.setItem(
                'loggedNoteappUser', JSON.stringify(user)
            )

            noteService.setToken(user.token)
            setUser(user)
            setUsername('')
            setPassword('')
        } catch {
            setErrorMessage('Wrong credentials')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
        }
    }

    const handleLogOut = () => {
        window.localStorage.removeItem('loggedNoteappUser')
        setUser(null)
    }

    const noteFormRef = useRef()

    const noteForm = () => (
        <Togglable buttonLabel='new note' ref={noteFormRef}>
            <NoteForm
                createNote={addNote}/>
        </Togglable>
    )

    return (
        <div>
            <h1>Notes</h1>
            <Notification message={errorMessage}/>
            {user !== null && <div>{user.name} is logged in</div>}
            {user === null &&
            <Togglable buttonLabel='log in'>
                <LoginForm
                    handleSubmit={handleLogin}
                    username={username}
                    password={password}
                    handleUsernameChange={({target}) => setUsername(target.value)}
                    handlePasswordChange={({target}) => setPassword(target.value)}
                />
            </Togglable>}
            {user !== null && <div>
                <button onClick={handleLogOut}>log out</button>
                {noteForm()}
            </div>}



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

            <Footer />
        </div>
    )
}

export default App