import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from "react-redux";
import { LoadingPage, MainPage, AdminPage, AuthPage } from "./pages";


export const useRoutes = () => {

    const { userData } = useSelector(({ user }) => user);
    const { userLoading } = useSelector(({ loading }) => loading);

    if (userLoading) {
        return (
            <Routes>
                <Route path="/" element={ <LoadingPage/> }/>
                <Route path="*" element={<Navigate to ="/" />}/>
            </Routes>
        )
    } else {
        if (userData.telegram_username) {
            return (
                <Routes>
                    <Route path="/" element={ <MainPage/> }/>
                    {
                        userData.role === "admin" &&
                        <Route path="/admin" element={ <AdminPage/> }/>
                    }
                    <Route path="*" element={<Navigate to ="/" />}/>
                </Routes>
            )
        } else {
            return (
                <Routes>
                    <Route path="/login" element={<AuthPage />}/>
                    <Route path="*" element={<Navigate to ="/login" />}/>
                </Routes>
            )
        }
    }
}
