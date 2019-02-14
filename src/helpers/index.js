import titleize from 'titleize';

export const rentalType = isShared => isShared ? 'Shared' : 'Entire'

export const toUpperCase = value => value ? titleize(value) : ''