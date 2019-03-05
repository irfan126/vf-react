const express = require('express');
const router = express.Router();
const Rental = require('../models/rental');
const User = require('../models/user');
const { normalizeErrors } = require('../helpers/mongoose');

const UserCtrl = require('../controllers/user');

router.get('/secret', UserCtrl.authMiddleware, function(req, res){
	res.json({"secret": true});
});

//Get all rentals for User
router.get('/manage', UserCtrl.authMiddleware, function(req, res) {
	const user = res.locals.user;

	Rental.where({user})
		  .populate('bookings')
		  .exec(function(err, foundRentals) {

		  	if (err) {
		  		return res.status(422).send({errors: normalizeErrors(err.errors)});
		  	}
		  	return res.json(foundRentals);
		});
});

router.get('/:id', function(req,res) {
	const rentalId = req.params.id;

	Rental.findById(rentalId)
		  .populate('user', 'username -_id')
		  .populate('bookings', 'startAt endAt -_id')
		  .exec(function(err, foundRental) {
				if (err) {
					return res.status(422).send({errors: [{title: 'Rental Error!', detail:'Could not find Rental'}]});
				}
				return res.json(foundRental);
			});
});

//Deleting a rental advert
router.delete('/:id', UserCtrl.authMiddleware, function(req, res){
	const user = res.locals.user;

	Rental.findById(req.params.id)
		  .populate('user', '_id')
		  .populate({
		  	path: 'bookings',
		  	select: 'startAt',
		  	match: { startAt: { $gt: new Date()}} //checking if start date is greater than today
		  })
		  .exec(function(err, foundRental){
		  	if (err) {
				return res.status(422).send({errors: normalizeErrors(err.errors)});
			}
			if (user.id !== foundRental.user.id) {
				return res.status(422).send({errors: [{title: 'Invalid User!', detail:'You are not rental owner!'}]});
			}
			if (foundRental.bookings.length > 0) {
				return res.status(422).send({errors: [{title: 'Active Bookings!', detail:'Cannot delete rental with active bookings!'}]});
			}
			foundRental.remove(function(err) {
				if (err) {
					return res.status(422).send({errors: normalizeErrors(err.errors)});
				}

				return res.json({'status': 'deleted'})
			});
	 });
});

//Adding a rental advert to DB
router.post('', UserCtrl.authMiddleware, function(req,res){
	const {title, city, street, category, image, shared, bedrooms, description, dailyRate } = req.body;
	const user = res.locals.user;

	const rental = new Rental({title, city, street, category, image, shared, bedrooms, description, dailyRate});
	rental.user = user; //adding USER to rental object

	//Adding new Rental to RENTAL DB
	Rental.create(rental, function(err, newRental){
			if (err) {
				  	  return res.status(422).send({errors: normalizeErrors(err.errors)});
				  	  }
			//Updating the user in the USER DB with new Rental ID 	  	  
			User.update({_id: user.id}, {$push: {rentals: newRental}}, function(){});

			return res.json(newRental);
	});
});

//Getting all rentals from DB or Searched City Rentals for rentals listing at frontend
router.get('', function(req, res) {

	const city = req.query.city;
	const query = city ? {city: city.toLowerCase()} : {};

	Rental.find(query)
		  .select('-bookings')
		  .exec(function(err, foundRentals) {
			if (err) {
				  	  return res.status(422).send({errors: normalizeErrors(err.errors)});
				  	  }
			if (city && foundRentals.length === 0) {
				  	  return res.status(422).send({errors: [{title: 'No rentals found!', detail:`There are no rentals for ${city}`}]});
				  	 }
					return res.json(foundRentals);
		});
});

module.exports = router;
