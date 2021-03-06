import axios from 'axios';
import authService from '../services/auth-service';
import axiosService from '../services/axios-service';

import { FETCH_RENTAL_BY_ID_SUCCESS, 
         FETCH_RENTAL_BY_ID_INIT, 
         FETCH_RENTALS_SUCCESS, 
         FETCH_RENTALS_INIT,
         FETCH_RENTALS_FAIL,
         LOGIN_SUCCESS, LOGIN_FAILURE,
         LOGOUT,
         FETCH_USER_BOOKINGS_SUCCESS,
         FETCH_USER_BOOKINGS_FAIL,
         FETCH_USER_BOOKINGS_INIT,
         UPDATE_RENTALS_SUCCESS,
         UPDATE_RENTALS_FAIL,
         RESET_RENTAL_ERRORS,
         RELOAD_MAP,
         RELOAD_MAP_FINISH } 
         from './types';

const axiosInstance = axiosService.getInstance();

//check user looged in for when editing rentals

export const verifyRentalOwner = (rentalId) => {
    return axiosInstance.get(`/rentals/${rentalId}/verify-user`);
}

//update map after edit rental

export const reloadMap = () => {
    return {
        type: RELOAD_MAP
    }
}

export const reloadMapFinish = () => {
    return {
       type: RELOAD_MAP_FINISH
    }
}

// RENTALS ACTION -------------------------------------

const fetchRentalByIdInit = () => {
    return{
        type: FETCH_RENTAL_BY_ID_INIT,
    }
}

const fetchRentalByIdSuccess = (rental) => {
    return{
        type: FETCH_RENTAL_BY_ID_SUCCESS,
        rental
    }
}

const fetchRentalsSuccess = (rentals) => {
    return{
        type: FETCH_RENTALS_SUCCESS,
        rentals
    }
}

//Actions
const fetchRentalsInit = () => {
    return {
        type: FETCH_RENTALS_INIT,
    }
}

//Actions
const fetchRentalsFail = (errors) => {
    return {
        type: FETCH_RENTALS_FAIL, 
        errors
    }
}

export const fetchRentals = (city) => {
    const url = city ? `/rentals?city=${city}` : '/rentals';

    return dispatch => {
        dispatch(fetchRentalsInit());

        axiosInstance.get(url)
             .then(res => res.data)   
             .then(rentals => dispatch(fetchRentalsSuccess(rentals)))
             .catch(({response}) => dispatch(fetchRentalsFail(response.data.errors)))
    }
}

// SEND REQUEST TO SERVER, ASYNC CODE 
export const fetchRentalById = (rentalId) => {
	
    return function(dispatch) {
        dispatch(fetchRentalByIdInit());

        axios.get(`/api/v1/rentals/${rentalId}`)
             .then(res => res.data)
             .then(rental => 
                dispatch(fetchRentalByIdSuccess(rental))
        );       
    }
}

// ACTION FOR CREATING A NEW RENTAL

export const createRental = (rentalData) => {
    return axiosInstance.post('/rentals', rentalData).then(
    res => res.data,
    err => Promise.reject(err.response.data.errors)
 )
}

//ACTION TO EDIT RENTALS

export const resetRentalErrors = () => {
    return {
        type: RESET_RENTAL_ERRORS
    }
}

const updateRentalSuccess = (updatedRental) => {
    return {
        type: UPDATE_RENTALS_SUCCESS,
        rental: updatedRental
    }
}

const updateRentalFail = (errors) => {
    return {
        type: UPDATE_RENTALS_FAIL,
        errors
    }
}

export const updateRental = (id, rentalData) => dispatch => {
    return axiosInstance.patch(`/rentals/${id}`, rentalData)
        .then(res => res.data)
        .then(updatedRental => {
            dispatch(updateRentalSuccess(updatedRental));

            if (rentalData.city || rentalData.street) {
                dispatch(reloadMap());
            }
        })
        .catch(({response}) => dispatch(updateRentalFail(response.data.errors)))
  
}   

// USER BOOKINGS ACTIONS ------------------------------------------

const fetchUserBookingsInit = () => {
    return {
        type: FETCH_USER_BOOKINGS_INIT
    }
}

const fetchUserBookingsSuccess = (userBookings) => {
    return {
        type: FETCH_USER_BOOKINGS_SUCCESS,
        userBookings
    }
}

const fetchUserBookingsFail = (errors) => {
    return {
        type: FETCH_USER_BOOKINGS_FAIL,
        errors
    }
}
export const fetchUserBookings = () => {
    return dispatch => {
        dispatch(fetchUserBookingsInit());

        axiosInstance.get('/bookings/manage')
             .then(res => res.data)   
             .then(userBookings => dispatch(fetchUserBookingsSuccess(userBookings)))
             .catch(({response}) => dispatch(fetchUserBookingsFail(response.data.errors)))
    }
}

// USER RENTALS ACTIONS ------------------------------------------

export const getUserRentals = () => {
    return axiosInstance.get('/rentals/manage').then(
    res => res.data,
    err => Promise.reject(err.response.data.errors)
 )
}

//Actions to delete Rental

export const deleteRental = (rentalId) => {
    return axiosInstance.delete(`/rentals/${rentalId}`).then(
        res => res.data,
        err => Promise.reject(err.response.data.errors))
}

// AUTH ACTIONS ------------------------------------------

// Actions for LOGIN_SUCCESS function
const loginSuccess = () => {
    const username =authService.getUsername();
    return {
        type: LOGIN_SUCCESS,
        username
    }
}

// Actions for LOGIN_FAILURE function
const loginFailure = (errors) => {
    return {
        type: LOGIN_FAILURE,
        errors
    }
}

export const register = (userData) => {
    return axios.post('/api/v1/users/register', userData).then(
    res => res.data,
    err => Promise.reject(err.response.data.errors)
 )
}

export const checkAuthState = () => {
    return dispatch => {
        if (authService.isAuthenticated()) {
            dispatch(loginSuccess());
        }
    }
}

// Actions for LOGIN success and failure function
export const login = (userData) => {
    return dispatch => {
        return axios.post('/api/v1/users/auth', userData)
        .then(res => res.data)
        .then(token => {
            authService.saveToken(token);
            dispatch(loginSuccess());
        })
        .catch((error) => {
            dispatch(loginFailure(error.response.data.errors));
        })
    }
}

export const logout = () => {
    authService.invalidateUser();
    
    return {
        type: LOGOUT
    }
}

export const createBooking = (booking) => {
    return axiosInstance.post('/bookings', booking)
            .then(res => res.data)
            .catch(({response}) => Promise.reject(response.data.errors))
}
