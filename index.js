/**
 * @file Philippine Government Offices API
 * @author Robert Soriano <sorianorobertc@gmail.com>
 * @version 0.0.1
 */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const Xray = require('x-ray');
const x = Xray();

const app = express();

app.use(compression());
app.use(cors());

const TARGET_URL = 'http://www.philexport.ph/web/philexp/government-offices';

/**
 * The main scraper
 */
function initScraping() {
	return new Promise ((resolve, reject) => {
		const scrape = x(TARGET_URL, '.marketdev_list_wrapper', [{
			name: '.marketdev_list_col1',
			link: '.web li a@href'
		}])
		scrape((err, result) => {
			if (err) {
				console.log(err);
				reject({
					message: 'An error occurred.'
				});
			}
			result = result.map((item, i) => {
				item.id = i + 1;
				return item;
			});
			resolve(result);
		})
	})
}

/**
 * Redirect to repo
 */
app.get('/', (req, res) => {
	res.redirect('https://github.com/sorxrob/ph-government-offices');
});

/**
 * Get all offices
 * 
 * @query {String} limit = Limit number of results.
 * @query {String} slug = Search an office by slug.
 */
app.get('/api/offices', (req, res) => {
	initScraping().then((data) => {
		if (req.query.limit && !req.query.slug) {
			data.length = req.query.limit;
		}
		if (req.query.slug) {
			const i = data.findIndex((d) => d.name.replace(/\s+/g, '-').toLowerCase() === req.query.slug);
			if (i >= 0) {
				data = data[i]
			} else {
				res.json({message: 'No data found with slug ' + req.query.slug});
				return;
			}
		}
		res.json(data);
	})
});

/**
 * Get all offices
 * 
 * @param {String} id = Get an office by id.
 */
app.get('/api/offices/:id', (req, res) => {
	initScraping().then((data) => {
		const i = data.findIndex((d) => d.id === +req.params.id)
		if (i >= 0) {
			return res.json(data[i]);
		} else {
			return res.json({
				message: 'No data found with id ' + req.params.id
			})
		}
	})
});

app.listen(3000)
