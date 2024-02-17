interface ISinger {
	name: string;
	nationality?: string;
	spotify?: string;
	youtube?: string;
	wikipedia?: string;
}

interface IVerse {
	spanish: string;
	english: string;
}

interface ILyrics extends Array<IVerse> {}

interface ISong {
	title: string;
	singer: ISinger;
	album?: string;
	spotify?: string;
	youtube?: string;
	lyrics: ILyrics;
}

class Singer {
	name: string;
	nationality?: string;
	spotify?: string;
	youtube?: string;
	wikipedia?: string;

	constructor({name, nationality, spotify, youtube, wikipedia}: ISinger) {
		this.name = name;
		this.nationality = nationality;
		this.spotify = spotify;
		this.youtube = youtube;
		this.wikipedia = wikipedia;
	}
}

class Song {
	title: string;
	singer: Singer;
	album?: string;
	spotify?: string;
	youtube?: string;
	lyrics: IVerse[];

	constructor({title, singer, album, spotify, youtube, lyrics}: ISong) {
		this.title = title;
		this.singer = singer;
		this.album = album;
		this.spotify = spotify;
		this.youtube = youtube;
		this.lyrics = lyrics;
	}
}

export {Singer, Song};
