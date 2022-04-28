// variables
const { MessageActionRow, MessageButton } = require('discord.js'),
	timeout = 120000;

module.exports = async (client, channel, pages, userID) => {
	let page = 0;

	const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('firstPage')
				.setLabel('⏮')
				.setStyle('SUCCESS')
				.setDisabled(true),
			new MessageButton()
				.setCustomId('previousPage')
				.setLabel('◀️')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('nextPage')
				.setLabel('▶️')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('lastPage')
				.setLabel('⏭')
				.setStyle('SUCCESS'),
		);

	const curPage = await channel.send({ embeds: [pages[page]], components: [row] });

	const buttonCollector = await curPage.createMessageComponentCollector({ componentType: 'BUTTON', time: timeout });

	// Descobrir qual botão foi usado, para assim atualizar as páginas
	buttonCollector.on('collect', (i) => {
		if (i.user.id !== userID) return i.deferUpdate();
		switch (i.customId) {
		case 'firstPage':
			page = 0;
			break;
		case 'previousPage':
			page = page > 0 ? --page : 0;
			break;
		case 'nextPage':
			page = page + 1 < pages.length ? ++page : (pages.length - 1);
			break;
		case 'lastPage':
			page = pages.length - 1;
			break;
		default:
			break;
		}
		(page === 0) ? row.components[0].setDisabled(true) : row.components[0].setDisabled(false);
		(page === pages.length - 1) ? row.components[3].setDisabled(true) : row.components[3].setDisabled(false);
		i.update({ embeds: [pages[page]], components: [row] });
		buttonCollector.resetTimer();
	});

	// Quando o timer acabar, desativa todos os buttons para mostrar o fim do paginator
	buttonCollector.on('end', async () => {
		for (let i = 0; i < row.components.length; i++) {
			row.components[i].setDisabled(true);
		}
		 curPage.edit({ embeds: [pages[page]], components: [row] });
		})
	return curPage;
};