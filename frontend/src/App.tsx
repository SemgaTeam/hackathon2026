import './App.css'
import { Admin, EditGuesser, ListGuesser, Resource, ShowGuesser } from 'react-admin'
import { dataProvider } from "./service/DataProvider";
import { authProvider } from "./service/AuthProvider";

export default function App() {
    return ( 
     <Admin dataProvider={dataProvider}
            authProvider={authProvider}>
                <Resource name="users"
                    list={ListGuesser}
                    edit={EditGuesser}
                    show={ShowGuesser}
                />

    </Admin>
    );
}