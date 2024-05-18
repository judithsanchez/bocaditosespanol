ChatGPT 3.5
Update the Youtube link and the release year.

Turn this song (in Spanish) lyrics into a regular text. Add the corresponding punctuation signs. Also, make sure that it is presented on a way that looks like regular text and not song lyrics.

Also, fix any typos that can be present on the lyrics due to artistic decision. This will be use for students of the Spanish language. For example, if you see "antoja'o" change it for its correct form "antojado".

I would like the result to be a json file with the following properties: title, artist, album, youtube video, spotify, genre (array of strings), released, lyrics (the text that I was telling you about before).

- Lyrics:
  Uno por pobre y feo, hombre
  Pero antoja'o, ay ome
  Tengo la camisa negra
  Hoy mi amor está de luto
  Hoy tengo en el alma una pena
  Y es por culpa de tu embrujo
  Hoy sé que tú ya no me quieres
  Y eso es lo que más me hiere
  Que tengo la camisa negra
  Y una pena que me duele
  Mal parece que solo me quedé
  Y fue pura todita tu mentira
  Qué maldita mala suerte la mía
  Que aquel día te encontré
  Por beber del veneno malevo de tu amor
  Yo quedé moribundo y lleno de dolor
  Respiré de ese humo amargo de tu adiós
  Y desde que tú te fuiste, yo solo
  Tengo
  Tengo la camisa negra
  Porque negra tengo el alma
  Yo por ti perdí la calma
  Y casi pierdo hasta mi cama
  Cama, cama, come on, baby
  Te digo con disimulo
  Que tengo la camisa negra
  Y debajo tengo el difunto
  Pa' enterrártelo cuando quieras, mamita
  Así como lo oyes, mi'ja
  Tengo la camisa negra
  Ya tu amor no me interesa
  Lo que ayer me supo a gloria
  Hoy me sabe a pura
  Miércoles por la tarde y tú que no llegas
  Ni siquiera muestras señas
  Y yo con la camisa negra
  Y tus maletas en la puerta
  Mal parece que solo me quedé
  Y fue pura todita tu mentira
  Qué maldita mala suerte la mía
  Que aquel día te encontré
  Por beber del veneno malevo de tu amor
  Yo quedé moribundo y lleno de dolor
  Respiré de ese humo amargo de tu adiós
  Y desde que tú te fuiste, yo solo
  Tengo
  Tengo la camisa negra
  Porque negra tengo el alma
  Yo por ti perdí la calma
  Y casi pierdo hasta mi cama
  Cama, cama, come on, baby
  Te digo con disimulo
  Que tengo la camisa negra
  Y debajo tengo el difunto
  Tengo la camisa negra
  Porque negra tengo el alma
  Yo por ti perdí la calma
  Y casi pierdo hasta mi cama
  Cama, cama, come on, baby
  Te digo con disimulo
  Que tengo la camisa negra
  Y debajo tengo el difunto

{
"title": "La Camisa Negra",
"artist": "Juanes",
"album": "Mi Sangre",
"youtube_video": "https://www.youtube.com/watch?v=3OWft3nZnUo",
"genre": ["Latin Pop", "Rock en Español"],
"released": "2005",
"lyrics": "Uno por pobre y feo, hombre. Pero antojado, ay hombre. Tengo la camisa negra. Hoy mi amor está de luto. Hoy tengo en el alma una pena. Y es por culpa de tu embrujo. Hoy sé que tú ya no me quieres. Y eso es lo que más me hiere. Que tengo la camisa negra. Y una pena que me duele. Mal parece que solo me quedé. Y fue pura todita tu mentira. Qué maldita mala suerte la mía. Que aquel día te encontré. Por beber del veneno malevo de tu amor. Yo quedé moribundo y lleno de dolor. Respiré de ese humo amargo de tu adiós. Y desde que tú te fuiste, yo solo. Tengo. Tengo la camisa negra. Porque negra tengo el alma. Yo por ti perdí la calma. Y casi pierdo hasta mi cama. Cama, cama, come on, baby. Te digo con disimulo. Que tengo la camisa negra. Y debajo tengo el difunto. Pa' enterrártelo cuando quieras, mamita. Así como lo oyes, mijita. Tengo la camisa negra. Ya tu amor no me interesa. Lo que ayer me supo a gloria. Hoy me sabe a pura. Miércoles por la tarde y tú que no llegas. Ni siquiera muestras señas. Y yo con la camisa negra. Y tus maletas en la puerta. Mal parece que solo me quedé. Y fue pura todita tu mentira. Qué maldita mala suerte la mía. Que aquel día te encontré. Por beber del veneno malevo de tu amor. Yo quedé moribundo y lleno de dolor. Respiré de ese humo amargo de tu adiós. Y desde que tú te fuiste, yo solo. Tengo. Tengo la camisa negra. Porque negra tengo el alma. Yo por ti perdí la calma. Y casi pierdo hasta mi cama. Cama, cama, come on, baby. Te digo con disimulo. Que tengo la camisa negra. Y debajo tengo el difunto. Tengo la camisa negra. Porque negra tengo el alma. Yo por ti perdí la calma. Y casi pierdo hasta mi cama. Cama, cama, come on, baby. Te digo con disimulo. Que tengo la camisa negra. Y debajo tengo el difunto."
}

---

Task: Augment the given JSON object by adding English translations and word types to the Spanish words in the tokens array. Translations should be contextually accurate, and word types should reference the WordType enum, using lowercase values for the type property.

Input Structure:

{
"sentence": "Tengo la camisa negra.",
"tokens": [
{"token": {"spanish": "Tengo", "normalizedToken": "tengo", "hasSpecialChar": false}, "type": "word"},
{"token": {"spanish": "la", "normalizedToken": "la", "hasSpecialChar": false}, "type": "word"},
{"token": {"spanish": "camisa", "normalizedToken": "camisa", "hasSpecialChar": false}, "type": "word"},
{"token": {"spanish": "negra", "normalizedToken": "negra", "hasSpecialChar": false}, "type": "word"},
{"token": ".", "type": "punctuationSign"}
]
}

Reference Types:

export enum WordType {
Noun = 'noun',
Verb = 'verb',
Conjunction = 'conjunction',
Prepostion = 'preposition',
Article = 'article',
}

Example Output:

[
{
"sentence": "Tengo la camisa negra.",
"tokens": [
{"token": {"spanish": "Tengo", "normalizedToken": "tengo", "english": "I have", "hasSpecialChar": false, "type": "verb"}, "type": "word"},
{"token": {"spanish": "la", "normalizedToken": "la", "english": "the", "hasSpecialChar": false, "type": "article"}, "type": "word"},
{"token": {"spanish": "camisa", "normalizedToken": "camisa", "english": "shirt", "hasSpecialChar": false, "type": "noun"}, "type": "word"},
{"token": {"spanish": "negra", "normalizedToken": "negra", "english": "black", "hasSpecialChar": false, "type": "adjective"}, "type": "word"},
{"token": ".", "type": "punctuationSign"}
]
}
]

Deliverable: Provide a JSON object with english translations and lowercase type properties based on the WordType enum for each word token.

JSON to modify:
