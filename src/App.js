import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
//import { listNotes } from './graphql/queries';
import { listPersons } from './graphql/queries';
//import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import { createPerson as createPersonMutation, deletePerson as deletePersonMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

function App() {
  // const [notes, setNotes] = useState([]);
  const [persons, setPersons] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    // fetchNotes();
    fetchPersons();
  }, []);

  // async function fetchNotes() {
  //   const apiData = await API.graphql({ query: listNotes });
  //   const notesFromAPI = apiData.data.listNotes.items;
  //   await Promise.all(notesFromAPI.map(async note => {
  //     if (note.image) {
  //       const image = await Storage.get(note.image);
  //       note.image = image;
  //     }
  //     return note;
  //   }))
  //   setNotes(apiData.data.listNotes.items);
  // }

  async function fetchPersons() {
    const apiData = await API.graphql({ query: listPersons });
    const notesFromAPI = apiData.data.listPersons.items;
    await Promise.all(notesFromAPI.map(async person => {
      if (person.image) {
        const image = await Storage.get(person.image);
        person.image = image;
      }
      return person;
    }))
    setPersons(apiData.data.listPersons.items);
  }

  // async function createNote() {
  //   if (!formData.name || !formData.description) return;
  //   await API.graphql({ query: createNoteMutation, variables: { input: formData } });
  //   if (formData.image) {
  //     const image = await Storage.get(formData.image);
  //     formData.image = image;
  //   }
  //   setNotes([ ...notes, formData ]);
  //   setFormData(initialFormState);
  // }

  async function createPerson() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createPersonMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setPersons([ ...persons, formData ]);
    setFormData(initialFormState);
  }

  // async function deleteNote({ id }) {
  //   const newNotesArray = notes.filter(note => note.id !== id);
  //   setNotes(newNotesArray);
  //   await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  // }

  async function deletePerson({ id }) {
    const newPersonsArray = persons.filter(person => person.id !== id);
    setPersons(newPersonsArray);
    await API.graphql({ query: deletePersonMutation, variables: { input: { id } }});
  }

  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    // fetchNotes();
    fetchPersons();
  }

  
  return (
    <div className="App">
      <h1>My Notes App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Note description"
        value={formData.description}
      />
      <input
        type="file"
        onChange={onChange}
      />
      {/* <button onClick={createNote}>Create Person</button> */}
      <button onClick={createPerson}>Create Person</button>
      <div style={{marginBottom: 30}}>
        {
          // notes.map(note => (
          persons.map(person => (
              // <div key={note.id || note.name}>
              <div key={person.id || person.name}>
              {/* <div>{note.name}</div> */}
              <div>{person.name}</div>
              {/* <div>{note.description}</div> */}
              <div>{person.description}</div>
              {/* <button onClick={() => deleteNote(note)}>Delete person</button> */}
              <button onClick={() => deletePerson(person)}>Delete person</button>
              {
                // note.image && <img src={note.image} style={{width: 100}} />
                person.image && <img src={person.image} style={{width: 100}} />
              }
            </div>
          ))
        }
        </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);