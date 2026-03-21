import '../App.css'
import { Admin, EditGuesser, ListGuesser, Resource, ShowGuesser, Layout } from 'react-admin'
import { dataProvider } from "../service/DataProvider";
import { authProvider } from "../service/AuthProvider";

const MyAppBar = () => null;

const MyLayout = (props) => (
    <Layout
        {...props}
        appBar={MyAppBar}
        sx={{
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: 'transparent',
            '& .RaLayout-content': {
                display: 'flex',
                flexDirection: 'column',
                p: 6,
                gap: 4,
                backgroundColor: 'transparent',
                boxShadow: 'none',
                mt: 0,
            },
            '& .RaLayout-sidebar': {
                backgroundColor: '#f8fafc',
                borderRight: '1px solid #e2e8f0',
                boxShadow: 'none',
                '& .MuiDrawer-paper': {
                    backgroundColor: 'transparent',
                    border: 'none',
                    position: 'static',
                },
                '& .RaMenuItemLink-active': {
                    borderLeft: '4px solid #ff4d3d',
                    backgroundColor: '#fff1f0',
                    color: '#ff4d3d',
                    fontBold: true,
                },
            }
        }}
    />
);

export default function AdminMenu() {
    return (
        <div className="w-full h-full bg-white flex flex-col">
            <Admin
                basename='/admin'
                layout={MyLayout}
                dataProvider={dataProvider}
                authProvider={authProvider}
                disableTelemetry
                requireAuthg
            >
                <Resource
                    name="users"
                    options={{ label: 'ПОЛЬЗОВАТЕЛИ' }}
                    list={ListGuesser}
                    edit={EditGuesser}
                    show={ShowGuesser}
                />
            </Admin>
        </div>
    );
}