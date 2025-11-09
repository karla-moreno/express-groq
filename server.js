const express = require('express');
const groq = require("groq");
const { parse, evaluate } = require('groq-js');
//https://github.com/sanity-io/groq-js/blob/main/API.md

const app = express();
const port = process.env.PORT || 4200;

const dataset = [
	{
		_type: 'book',
		_id: 'book-1',
		title: 'The Hitchhiker\'s Guide to the Galaxy',
		author: {
			_type: 'author',
			name: 'Douglas Adams',
			bio: 'A brilliant satirist and author.'
		},
		genres: ['sci-fi', 'comedy'],
		published: 1979,
		pages: 193,
		available: true,
	},
	{
		_type: 'book',
		_id: 'book-2',
		title: 'The Restaurant at the End of the Universe',
		author: {
			_type: 'author',
			name: 'Douglas Adams',
			bio: 'A brilliant satirist and author.'
		},
		genres: ['sci-fi', 'comedy'],
		published: 1980,
		pages: 250,
		available: false,
	},
	{
		_type: 'book',
		_id: 'book-3',
		title: '1984',
		author: {
			_type: 'author',
			name: 'George Orwell',
			bio: 'Known for his dystopian novels.'
		},
		genres: ['dystopian', 'sci-fi'],
		published: 1949,
		pages: 328,
		available: true,
	},
	{
		_type: 'author',
		_id: 'author-1',
		name: 'Douglas Adams',
		bio: 'A brilliant satirist and author.',
		nationality: 'British'
	},
	{
		_type: 'author',
		_id: 'author-2',
		name: 'George Orwell',
		bio: 'Known for his dystopian novels.',
		nationality: 'British'
	},
	{
		_type: 'category',
		_id: 'cat-1',
		title: 'sci-fi'
	},
	{
		_type: 'category',
		_id: 'cat-2',
		title: 'comedy'
	},
];

app.use(express.json());

app.get('/', (req, res) => {
	res.send('Welcome to express-groq!')
})
app.get('/test', (req, res) => {
	res.status(418).send({message: 'I\'m a tea pot'})
})

app.post('/groq/query', async (req, res) => {
	const {query, params} = req.body;
	if (!query) {
		return res.status(400).send({error: 'query is required'});
	}

	try {
		const tree = parse(query);  //abstract syntax tree
		const result = await evaluate(tree, {dataset: dataset, params: params});
		const data = await result.get();
		res.json(data)
	} catch (error) {
		console.error('error executing GROQ query', error.message);
		res.status(400).send({error: `Invalid GROQ query or execution error`, details: error.message});
	}
})

app.get('/book/:id', async (req, res) => {
	const query = groq`*[_type == 'book' && _id == $id][0]`
	const params = {id: req.params.id};
	try {
		const tree = parse(query);  //abstract syntax tree
		const result = await evaluate(tree, {dataset: dataset, params: params});
		const data = await result.get();
		res.json(data)
	} catch (error) {
		console.error('error executing GROQ query', error.message);
		res.status(400).send({error: `Invalid GROQ query or execution error`, details: error.message});
	}
})

app.get('/book-search', async (req, res) => {
	const params = req.params
	const query = groq`${req.query.query}`;
	const name = req.query.name;
	console.log(name)
	console.log({
		query,
		name
	})
	// res.send({query, params})
	try {
		const tree = parse(query);  //abstract syntax tree
		const result = await evaluate(tree, {dataset: dataset, params: {name: req.query.name}});
		const data = await result.get();
		res.json(data)
	} catch (error) {
		console.error('error executing GROQ query', error.message);
		res.status(400).send({error: `Invalid GROQ query or execution error`, details: error.message});
	}
})

app.listen(port, () => {
	console.log(`server running on http://localhost:${port}`);
	console.log('test with POST requests to /groq/query with GROQ query string in the body')
})
