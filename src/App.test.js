import React from "react";
import {render, fireEvent, waitFor, screen} from "@testing-library/react";
import Login from "../src/pages/Login";

describe('Login', () => {
    it('should handle successful login', async () => {
        const mockResponse = {message: "User logged in", data: {token: "token", role: "role"}};
        jest.spyOn(window, 'fetch').mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });
        });

        render(<Login/>);

        const emailInput = screen.getByLabelText('Email address');
        const passwordInput = screen.getByLabelText('Password');
        const loginButton = screen.getByTestId('login-button');

        fireEvent.change(emailInput, {target: {value: 'et@gmail.com'}});
        console.log(emailInput.value)
        fireEvent.change(passwordInput, {target: {value: '123456'}});
        console.log(passwordInput.value)
        fireEvent.click(loginButton);
        console.log(window.location.href)
        await waitFor(() => {
            expect(localStorage.getItem("token")).toEqual("token");
            expect(localStorage.getItem("role")).toEqual("role");

        });

        window.fetch.mockRestore();
    });

    it('should handle invalid credentials', async () => {
        const mockResponse = {errors: [{msg: 'Invalid credentials'}]};
        jest.spyOn(window, 'fetch').mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });
        });

        render(<Login/>);

        const emailInput = screen.getByLabelText('Email address');
        const passwordInput = screen.getByLabelText('Password');
        const loginButton = screen.getByTestId('login-button');

        fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
        fireEvent.change(passwordInput, {target: {value: 'password123'}});
        fireEvent.click(loginButton);
        console.log(window.location.href)
        await waitFor(() => {
           // expect(window.location.href).toEqual('http://localhost:3000/login');
        });

        window.fetch.mockRestore();
    });

    it('should handle missing fields', async () => {
        const mockResponse = {errors: [{msg: 'Missing fields'}]};
        jest.spyOn(window, 'fetch').mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });
        });

        render(<Login/>);

        const loginButton = screen.getByTestId('login-button');
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(alert).toHaveBeenCalledWith('Fill in all fields');
        });

        window.fetch.mockRestore();
    });
});
