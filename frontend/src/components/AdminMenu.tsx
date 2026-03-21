import { 
    Admin, Resource, Layout, List, Datagrid, 
    TextField, BooleanField, DateField, 
    SearchInput, useRecordContext, Create, SimpleForm, TextInput, SelectInput,
    defaultTheme
} from 'react-admin';
import { dataProvider } from "../service/DataProvider";
import { authProvider } from "../service/AuthProvider";

const myTheme = {
    ...defaultTheme,
    palette: {
        mode: 'light' as const,
        primary: { main: '#FF4231' },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
        text: {
            primary: '#0A1F33',
            secondary: '#94a3b8',
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: { boxShadow: 'none', border: 'none' },
            },
        },
    },
};

const RoleBadge = () => {
    const record = useRecordContext();
    if (!record) return null;
    const isAdmin = record.role === 'admin';
    return (
        <span style={{
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '9px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: isAdmin ? '#FF4231' : '#F1F3F6',
            color: isAdmin ? '#FFFFFF' : '#64748b',
            display: 'inline-block'
        }}>
            {record.role}
        </span>
    );
};

const UserCreate = () => (
    <Create title="НОВЫЙ ПОЛЬЗОВАТЕЛЬ">
        <SimpleForm sx={{ p: 4 }}>
            <TextInput source="username" label="ЛОГИН" fullWidth sx={{ mb: 2 }} />
            <TextInput source="fullname" label="ФИО" fullWidth sx={{ mb: 2 }} />
            <TextInput source="password" label="ПАРОЛЬ" type="password" fullWidth sx={{ mb: 2 }} />
            <SelectInput source="role" label="РОЛЬ" choices={[
                { id: 'user', name: 'User' },
                { id: 'host', name: 'Host' },
                { id: 'admin', name: 'Admin' },
            ]} fullWidth />
        </SimpleForm>
    </Create>
);

const userFilters = [
    <SearchInput source="q" alwaysOn placeholder="ПОИСК..." sx={{ 
        '& .MuiInputBase-root': { 
            borderRadius: '16px', 
            backgroundColor: '#F1F3F6', 
            border: 'none',
            fontSize: '12px',
            fontWeight: 'bold',
            width: '250px',
            '&:after, &:before': { display: 'none' }
        }
    }} />
];

const UserList = () => (
    <List 
        filters={userFilters}
        title=" "
        sx={{
            '& .RaList-main': { mt: 0, backgroundColor: 'transparent' },
            '& .MuiToolbar-root': { backgroundColor: 'transparent' },
        }}
    >
        <Datagrid 
            rowClick="edit"
            bulkActionButtons={false}
            sx={{
                backgroundColor: 'white',
                '& .MuiTableCell-head': {
                    color: '#94a3b8',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid #F1F3F6',
                },
                '& .MuiTableCell-body': {
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0A1F33',
                    borderBottom: '1px solid #F1F3F6',
                },
                '& .MuiTableRow-root:hover': {
                    backgroundColor: '#F8FAFC !important',
                }
            }}
        >
            <TextField source="username" label="ЛОГИН" />
            <TextField source="fullname" label="ФИО" />
            <RoleBadge label="РОЛЬ" />
            <BooleanField source="isDeleted" label="DEL" />
            <DateField source="createdAt" label="ДАТА" />
        </Datagrid>
    </List>
);

const MyLayout = (props: any) => (
    <Layout
        {...props}
        appBar={() => null}
        sidebar={() => null}
        sx={{
            '& .RaLayout-content': {
                backgroundColor: 'white',
                p: { xs: 2, md: 5 },
            },
            '& .RaLayout-appFrame': { backgroundColor: 'white' }
        }}
    />
);

export default function AdminMenu() {
    return (
        <Admin
            basename='/admin'
            layout={MyLayout}
            theme={myTheme}
            dataProvider={dataProvider}
            authProvider={authProvider}
            disableTelemetry
        >
            <Resource
                name="users"
                options={{ label: 'ПОЛЬЗОВАТЕЛИ' }}
                list={UserList}
                create={UserCreate}
            />
        </Admin>
    );
}