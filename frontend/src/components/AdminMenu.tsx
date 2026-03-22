import { 
    Admin, Resource, Layout, List, Datagrid, 
    TextField, BooleanField, DateField, 
    SearchInput, useRecordContext, Create, SimpleForm, TextInput, SelectInput,
    defaultTheme,
    Edit,
    EditButton,
    DeleteButton,
    TopToolbar,
    CreateButton,
    ExportButton,
    type LayoutProps,
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

const RoleBadge = ({ label }: { label?: string }) => {
    void label;
    const record = useRecordContext<{ role?: string }>();
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

const UserEdit = () => (
    <Edit title="РЕДАКТИРОВАНИЕ ПРОФИЛЯ">
        <SimpleForm sx={{ p: 4 }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                <TextInput source="id" disabled sx={{ flex: 1 }} />
                <TextInput source="username" label="ЛОГИН" sx={{ flex: 2 }} />
            </div>
            <TextInput source="fullname" label="ФИО" fullWidth />
            
            <div style={{ padding: '16px', backgroundColor: '#FFF9F8', borderRadius: '16px', marginTop: '20px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '10px', fontWeight: '900', color: '#FF4231' }}>БЕЗОПАСНОСТЬ</p>
                <TextInput 
                    source="password" 
                    label="НОВЫЙ ПАРОЛЬ (ОСТАВЬТЕ ПУСТЫМ, ЧТОБЫ НЕ МЕНЯТЬ)" 
                    type="password" 
                    fullWidth 
                />
                <SelectInput source="role" label="РОЛЬ" choices={[
                    { id: 'user', name: 'User' },
                    { id: 'host', name: 'Host' },
                    { id: 'admin', name: 'Admin' },
                ]} fullWidth />
                <BooleanField source="isDeleted" label="ЗАБЛОКИРОВАН" />
            </div>
        </SimpleForm>
    </Edit>
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

const ListActions = () => (
    <TopToolbar>
        <CreateButton variant="contained" sx={{ borderRadius: '12px', px: 3 }} />
        <ExportButton />
    </TopToolbar>
);

const UserList = () => (
    <List 
        actions={<ListActions />}
        filters={userFilters}
        sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}
    >
        <Datagrid 
            rowClick="edit"
            sx={{
                '& .MuiTableCell-root': { py: 2 },
                '& .MuiTableRow-root': { transition: '0.2s' }
            }}
        >
            <TextField source="username" label="ЛОГИН" />
            <TextField source="fullname" label="ФИО" />
            <RoleBadge label="РОЛЬ" />
            <DateField source="createdAt" label="СОЗДАН" showTime />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <EditButton color="primary" />
                <DeleteButton mutationMode="pessimistic" />
            </div>
        </Datagrid>
    </List>
);

const MyLayout = (props: LayoutProps) => (
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
                options={{ label: 'Управление доступом' }}
                list={UserList}
                create={UserCreate}
                edit={UserEdit}
            />
        </Admin>
    );
}
