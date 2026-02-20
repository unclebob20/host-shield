import React, { createContext, useContext, useState, useCallback } from 'react';

const AdminThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => { },
});

export const useAdminTheme = () => useContext(AdminThemeContext);

export const AdminThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(
        () => localStorage.getItem('admin-theme') || 'dark'
    );

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('admin-theme', next);
            return next;
        });
    }, []);

    return (
        <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </AdminThemeContext.Provider>
    );
};
