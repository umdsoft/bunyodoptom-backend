const knexLib = require('knex');
const { Model } = require('objection');
const knexConfig = require('./knexfile');

const knex = knexLib(knexConfig);
Model.knex(knex);

module.exports = knex;
