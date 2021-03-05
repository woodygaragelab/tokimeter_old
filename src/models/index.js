// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Note, Person } = initSchema(schema);

export {
  Note,
  Person
};