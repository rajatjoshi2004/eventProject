const pick = require('../utils/pick');
var mongoose = require("mongoose");
const moment = require('moment');
const  Events  = require('../models/Events');

const create = (async (req, res) => {
  var orgId = mongoose.mongo.ObjectId(req.user.companyName);
  var userId = mongoose.mongo.ObjectId(req.user.id);

  try{
    const product = await Events.create({orgId,userId,...req.body});
    res.send({ status: true, data: product });  
  }
  catch(error){
    res.send({status:false,message:error.message})
  }
   
});

const getAllEvents = (async (req, res) => {
  let filter = pick(req.query, ['search', 'status' , 'date']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  // serach filter for question as regex
  // eslint-disable-next-line no-prototype-builtins



  if (filter.hasOwnProperty('search')) {
    filter = {
      ...filter,
      name: { $regex: new RegExp(`.*${filter.search.toLowerCase()}.*`), $options: 'i' },
      category: { $regex: new RegExp(`.*${filter.search.toLowerCase()}.*`), $options: 'i' },
      // relationType: { '$regex': new RegExp(`.*${filter.search.toLowerCase()}.*`), $options: 'i' }
    };
  }

  if (req.query.hasOwnProperty('date')) {
    const dateToMatch = req.query.date;
    const parsedDate = moment(dateToMatch);
    const startDay = parsedDate.startOf('day').toISOString();
    const endDay = parsedDate.endOf('day').toISOString();

    filter = {
      $or: [
        { 'date': { $gte: startDay, $lte: endDay } },
  
      ],
    };
  }

  delete filter.search;

  let result = await Events.find(filter);(filter, options);

  res.send({ result, status: true });
});

const get = (async (req, res) => {
  const product = await Events.findById(req.params.id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
  }
  res.send(product);
});

const getAll = (async (req, res) => {
  const result = await Events.find({
    sort: { createdAt: -1 }
  });
  res.send({ result, status: true });
});
const getEventById = (async (req, res) => {
  const result = await Events.findById({ status: 'ACTIVE', _id: req.params.id });
  res.send({ result, status: true });
});

const updateEvent = (async (req, res) => {
  const item = await getById(req.params.id);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
  }
  Object.assign(item, req.body);
  await item.save();
  res.send({ status: true, data: item });
});

const deleteEvent = (async (req, res) => {
  await Events.getById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});


module.exports = {
  create,
  getAllEvents,
  get,
  getAll,
  updateEvent,
  deleteEvent,
  getEventById,
};
