const config = {
	ownerID: ['238458279888420864', '626565890938241024'],
	token: 'NjYxNDEwMjk4ODY2OTU4MzM5.XgrAVw.9Pf0PcVjZUh5M9DDS7JbAha7I40',
	api_keys: {
		//
		spotify: {
			iD: '6ba56b32b4d4439e96e3223e40d45d18',
			secret: 'adcd4c3b4a2d4f17bfcf4449c8c6dc66',
		},
		//
		genuis: '1iGC1376cJm6dTFIEQB23KfnTr06OOx9FxqO7O1jadXSRAnIkURAUeymeU9LhuZk',
		// https://top.gg/bot/661410298866958339/webhooks
		topggtoken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MTQxMDI5ODg2Njk1ODMzOSIsImJvdCI6dHJ1ZSwiaWF0IjoxNjM1MjkzNjgzfQ.D2yDd8pugXSYKOTGwGcBlI_Ilcyuo4X6N9Y5kgATQuQ'
	},
	//
	SupportServer: {
		//
		link: 'https://discord.gg/',
		//
		GuildID: '493436534566158340',
		//
		ModRole: '894239144455315466',
		//
		SuggestionChannel: '894238555004624957',
		//
		GuildChannel: '906210281791819876',

		rateLimitChannelID: '961257477888958525',
	},
	LavalinkNodes: [
		{ host: 'localhost', port: 5512, password: 'squarelink', identifier: 'Kaneda' },
	],
	API: {
		port: 80,
		secure: true,
		token: '123456789',
	},
	//
	MongoDBURl: 'mongodb+srv://root:a.b.n.e.r.123@galdinocluster.fl4lf.mongodb.net/GaldinoCanaryDB?retryWrites=true&w=majority',
	//
	embedColor: '3a1b54',
	//
	debug: false,
};

module.exports = config;
