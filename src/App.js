import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listPersons } from './graphql/queries';
import { createPerson as createPersonMutation, deletePerson as deletePersonMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

function App() {
  const [persons, setPersons] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchPersons();
  }, []);

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
      <button onClick={createPerson}>Create Person</button>
      <div style={{marginBottom: 30}}>
        {
          persons.map(person => (
              <div key={person.id || person.name}>
              <div>{person.name}</div>
              <div>{person.description}</div>
              <button onClick={() => deletePerson(person)}>Delete person</button>
              {
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