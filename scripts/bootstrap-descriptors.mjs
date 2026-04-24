#!/usr/bin/env node
/**
 * Bootstrap descriptor, title, and nickname data into all LC profiles.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const LC_DIR = resolve(__dirname, '../packages/namegen/data/lc');

const CULTURAL_DATA = {
  'en-us': {
    descriptors: [
      { text: 'the Great', ipa: '/ðə ɡɹeɪt/', type: 'descriptor', frequency: 1.0 },
      { text: 'the Wise', ipa: '/ðə waɪz/', type: 'descriptor', frequency: 0.8 },
      { text: 'the Cruel', ipa: '/ðə kɹuːl/', type: 'descriptor', frequency: 0.6 },
      { text: 'the Bold', ipa: '/ðə boʊld/', type: 'descriptor', frequency: 0.7 },
      { text: 'the Tall', ipa: '/ðə tɔːl/', type: 'descriptor', frequency: 0.5 },
      { text: 'the Swift', ipa: '/ðə swɪft/', type: 'descriptor', frequency: 0.5 },
      { text: 'the Grim', ipa: '/ðə ɡɹɪm/', type: 'descriptor', frequency: 0.4 },
      { text: 'the Just', ipa: '/ðə dʒʌst/', type: 'descriptor', frequency: 0.6 },
    ],
    descriptor_nouns: [
      { text: 'the Bear', ipa: '/ðə bɛɹ/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'the Eagle', ipa: '/ðə ˈiːɡəl/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'the Mountain', ipa: '/ðə ˈmaʊntən/', type: 'descriptor_noun', frequency: 0.6 },
      { text: 'the Wolf', ipa: '/ðə wʊlf/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'the Hammer', ipa: '/ðə ˈhæmɚ/', type: 'descriptor_noun', frequency: 0.5 },
      { text: 'the Storm', ipa: '/ðə stɔɹm/', type: 'descriptor_noun', frequency: 0.6 },
      { text: 'the Iron', ipa: '/ðə ˈaɪɚn/', type: 'descriptor_noun', frequency: 0.5 },
      { text: 'the Lion', ipa: '/ðə ˈlaɪən/', type: 'descriptor_noun', frequency: 0.7 },
    ],
    titles: [
      { text: 'Sir', ipa: '/sɚ/', position: 'prefix', frequency: 1.0 },
      { text: 'Lord', ipa: '/lɔɹd/', position: 'prefix', frequency: 0.8 },
      { text: 'Captain', ipa: '/ˈkæptən/', position: 'prefix', frequency: 0.7 },
      { text: 'Marshal', ipa: '/ˈmɑɹʃəl/', position: 'prefix', frequency: 0.5 },
      { text: 'the Conqueror', ipa: '/ðə ˈkɑŋkəɹɚ/', position: 'suffix', frequency: 0.4 },
      { text: 'the Magnificent', ipa: '/ðə mæɡˈnɪfəsənt/', position: 'suffix', frequency: 0.3 },
    ],
    nicknames: [
      { text: 'Red', ipa: '/ɹɛd/', frequency: 0.7 },
      { text: 'Slim', ipa: '/slɪm/', frequency: 0.5 },
      { text: 'Lucky', ipa: '/ˈlʌki/', frequency: 0.6 },
      { text: 'Dutch', ipa: '/dʌtʃ/', frequency: 0.4 },
      { text: 'Tex', ipa: '/tɛks/', frequency: 0.5 },
      { text: 'Buzz', ipa: '/bʌz/', frequency: 0.4 },
    ],
  },
  'en-gb': {
    descriptors: [
      { text: 'the Great', ipa: '/ðə ɡɹeɪt/', type: 'descriptor', frequency: 1.0 },
      { text: 'the Wise', ipa: '/ðə waɪz/', type: 'descriptor', frequency: 0.8 },
      { text: 'the Noble', ipa: '/ðə ˈnoʊbəl/', type: 'descriptor', frequency: 0.7 },
      { text: 'the Stern', ipa: '/ðə stɚn/', type: 'descriptor', frequency: 0.5 },
      { text: 'the Fair', ipa: '/ðə fɛɹ/', type: 'descriptor', frequency: 0.6 },
      { text: 'the Valiant', ipa: '/ðə ˈvæljənt/', type: 'descriptor', frequency: 0.5 },
    ],
    descriptor_nouns: [
      { text: 'the Lion', ipa: '/ðə ˈlaɪən/', type: 'descriptor_noun', frequency: 0.9 },
      { text: 'the Rose', ipa: '/ðə ɹoʊz/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'the Raven', ipa: '/ðə ˈɹeɪvən/', type: 'descriptor_noun', frequency: 0.6 },
      { text: 'the Oak', ipa: '/ðə oʊk/', type: 'descriptor_noun', frequency: 0.6 },
      { text: 'the Sword', ipa: '/ðə sɔɹd/', type: 'descriptor_noun', frequency: 0.5 },
      { text: 'the Tower', ipa: '/ðə ˈtaʊɚ/', type: 'descriptor_noun', frequency: 0.5 },
    ],
    titles: [
      { text: 'Sir', ipa: '/sɚ/', position: 'prefix', frequency: 1.0 },
      { text: 'Lord', ipa: '/lɔɹd/', position: 'prefix', frequency: 0.9 },
      { text: 'Duke', ipa: '/djuːk/', position: 'prefix', frequency: 0.6 },
      { text: 'Earl', ipa: '/ɚl/', position: 'prefix', frequency: 0.5 },
      { text: 'the Exile', ipa: '/ðə ˈɛɡzaɪl/', position: 'suffix', frequency: 0.3 },
    ],
    nicknames: [
      { text: 'Red', ipa: '/ɹɛd/', frequency: 0.6 },
      { text: 'Slim', ipa: '/slɪm/', frequency: 0.5 },
      { text: 'Scar', ipa: '/skɑɹ/', frequency: 0.4 },
      { text: 'Nobby', ipa: '/ˈnɑbi/', frequency: 0.4 },
    ],
  },
  'en-ie': {
    descriptors: [
      { text: 'the Bold', ipa: '/ðə boʊld/', type: 'descriptor', frequency: 0.8 },
      { text: 'the Red', ipa: '/ðə ɹɛd/', type: 'descriptor', frequency: 0.7 },
      { text: 'the Strong', ipa: '/ðə stɹɔŋ/', type: 'descriptor', frequency: 0.6 },
    ],
    descriptor_nouns: [
      { text: 'the Wolf', ipa: '/ðə wʊlf/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'the Oak', ipa: '/ðə oʊk/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'the Crow', ipa: '/ðə kɹoʊ/', type: 'descriptor_noun', frequency: 0.5 },
    ],
    titles: [
      { text: 'Sir', ipa: '/sɚ/', position: 'prefix', frequency: 0.9 },
      { text: 'Chief', ipa: '/tʃiːf/', position: 'prefix', frequency: 0.6 },
    ],
    nicknames: [
      { text: 'Red', ipa: '/ɹɛd/', frequency: 0.7 },
      { text: 'Paddy', ipa: '/ˈpædi/', frequency: 0.6 },
      { text: 'Mick', ipa: '/mɪk/', frequency: 0.5 },
    ],
  },
  'en-au': {
    descriptors: [
      { text: 'the Tough', ipa: '/ðə tʌf/', type: 'descriptor', frequency: 0.8 },
      { text: 'the Lucky', ipa: '/ðə ˈlʌki/', type: 'descriptor', frequency: 0.7 },
    ],
    descriptor_nouns: [
      { text: 'the Roo', ipa: '/ðə ɹuː/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'the Dingo', ipa: '/ðə ˈdɪŋɡoʊ/', type: 'descriptor_noun', frequency: 0.6 },
      { text: 'the Outback', ipa: '/ðə ˈaʊtbæk/', type: 'descriptor_noun', frequency: 0.5 },
    ],
    titles: [
      { text: 'Mate', ipa: '/meɪt/', position: 'suffix', frequency: 0.7 },
      { text: 'Skipper', ipa: '/ˈskɪpɚ/', position: 'prefix', frequency: 0.5 },
    ],
    nicknames: [
      { text: 'Blue', ipa: '/bluː/', frequency: 0.8 },
      { text: 'Digger', ipa: '/ˈdɪɡɚ/', frequency: 0.6 },
    ],
  },
  'en-ca': {
    descriptors: [
      { text: 'the Strong', ipa: '/ðə stɹɔŋ/', type: 'descriptor', frequency: 0.7 },
      { text: 'the True', ipa: '/ðə tɹuː/', type: 'descriptor', frequency: 0.6 },
    ],
    descriptor_nouns: [
      { text: 'the Moose', ipa: '/ðə muːs/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'the Beaver', ipa: '/ðə ˈbiːvɚ/', type: 'descriptor_noun', frequency: 0.6 },
      { text: 'the Maple', ipa: '/ðə ˈmeɪpəl/', type: 'descriptor_noun', frequency: 0.5 },
    ],
    titles: [
      { text: 'Sir', ipa: '/sɚ/', position: 'prefix', frequency: 0.8 },
      { text: 'Captain', ipa: '/ˈkæptən/', position: 'prefix', frequency: 0.6 },
    ],
    nicknames: [
      { text: 'Hoser', ipa: '/ˈhoʊzɚ/', frequency: 0.6 },
      { text: 'Smitty', ipa: '/ˈsmɪti/', frequency: 0.5 },
    ],
  },
  'ja-jp': {
    descriptors: [
      { text: 'Ōi', ipa: '/oːi/', type: 'descriptor', frequency: 0.8 },
      { text: 'Kiyoshi', ipa: '/kijoʃi/', type: 'descriptor', frequency: 0.7 },
      { text: 'Takai', ipa: '/takai/', type: 'descriptor', frequency: 0.6 },
      { text: 'Fukai', ipa: '/ɸɯkai/', type: 'descriptor', frequency: 0.5 },
    ],
    descriptor_nouns: [
      { text: 'Yama', ipa: '/jama/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'Tatsu', ipa: '/tatɕɯ/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'Kuma', ipa: '/kɯma/', type: 'descriptor_noun', frequency: 0.6 },
      { text: 'Kitsune', ipa: '/kitsɯne/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'Kaze', ipa: '/kaze/', type: 'descriptor_noun', frequency: 0.5 },
    ],
    titles: [
      { text: 'San', ipa: '/saɴ/', position: 'suffix', frequency: 1.0 },
      { text: 'Sama', ipa: '/sama/', position: 'suffix', frequency: 0.7 },
      { text: 'Kun', ipa: '/kɯɴ/', position: 'suffix', frequency: 0.6 },
      { text: 'Daimyō', ipa: '/daimʲoː/', position: 'prefix', frequency: 0.4 },
    ],
    nicknames: [
      { text: 'Chan', ipa: '/tɕaɴ/', frequency: 0.7 },
      { text: 'Bō', ipa: '/boː/', frequency: 0.5 },
      { text: 'Maru', ipa: '/maɾɯ/', frequency: 0.6 },
    ],
  },
  'zh-cn': {
    descriptors: [
      { text: 'Dà', ipa: '/ta/', type: 'descriptor', frequency: 0.9 },
      { text: 'Míng', ipa: '/miŋ/', type: 'descriptor', frequency: 0.7 },
      { text: 'Yǒng', ipa: '/joŋ/', type: 'descriptor', frequency: 0.6 },
    ],
    descriptor_nouns: [
      { text: 'Lóng', ipa: '/loŋ/', type: 'descriptor_noun', frequency: 0.9 },
      { text: 'Hǔ', ipa: '/xu/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'Shān', ipa: '/ʂan/', type: 'descriptor_noun', frequency: 0.6 },
      { text: 'Fēng', ipa: '/fəŋ/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Xiānshēng', ipa: '/ɕjɛnʂəŋ/', position: 'suffix', frequency: 0.9 },
      { text: 'Wáng', ipa: '/waŋ/', position: 'prefix', frequency: 0.6 },
      { text: 'Jiàngjūn', ipa: '/tɕjaŋtɕyn/', position: 'prefix', frequency: 0.5 },
    ],
    nicknames: [
      { text: 'Ā', ipa: '/a/', frequency: 0.7 },
      { text: 'Xiǎo', ipa: '/ɕjau/', frequency: 0.6 },
    ],
  },
  'de-de': {
    descriptors: [
      { text: 'der Große', ipa: '/deːɐ̯ ˈɡʁoːsə/', type: 'descriptor', frequency: 1.0 },
      { text: 'der Weise', ipa: '/deːɐ̯ ˈvaizə/', type: 'descriptor', frequency: 0.8 },
      { text: 'der Strenge', ipa: '/deːɐ̯ ˈʃtʁɛŋə/', type: 'descriptor', frequency: 0.5 },
      { text: 'der Tapfere', ipa: '/deːɐ̯ ˈtapfəʁə/', type: 'descriptor', frequency: 0.6 },
    ],
    descriptor_nouns: [
      { text: 'der Bär', ipa: '/deːɐ̯ bɛːɐ̯/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'der Wolf', ipa: '/deːɐ̯ vɔlf/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'der Adler', ipa: '/deːɐ̯ ˈadlɐ/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'der Hammer', ipa: '/deːɐ̯ ˈhamɐ/', type: 'descriptor_noun', frequency: 0.5 },
      { text: 'der Eiserne', ipa: '/deːɐ̯ ˈaizəʁnə/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Herr', ipa: '/hɛʁ/', position: 'prefix', frequency: 1.0 },
      { text: 'Graf', ipa: '/ɡʁaːf/', position: 'prefix', frequency: 0.7 },
      { text: 'Baron', ipa: '/baˈʁoːn/', position: 'prefix', frequency: 0.5 },
      { text: 'Feldwebel', ipa: '/ˈfɛltveːbl̩/', position: 'prefix', frequency: 0.4 },
    ],
    nicknames: [
      { text: 'Fritz', ipa: '/fʁɪts/', frequency: 0.7 },
      { text: 'Hans', ipa: '/hans/', frequency: 0.6 },
      { text: 'Klaus', ipa: '/klaʊs/', frequency: 0.5 },
    ],
  },
  'fr-fr': {
    descriptors: [
      { text: 'le Grand', ipa: '/lə ɡʁɑ̃/', type: 'descriptor', frequency: 1.0 },
      { text: 'le Sage', ipa: '/lə saʒ/', type: 'descriptor', frequency: 0.8 },
      { text: 'le Cruel', ipa: '/lə kʁyɛl/', type: 'descriptor', frequency: 0.5 },
      { text: 'le Brave', ipa: '/lə bʁav/', type: 'descriptor', frequency: 0.6 },
    ],
    descriptor_nouns: [
      { text: 'le Lion', ipa: '/lə ljɔ̃/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'le Loup', ipa: '/lə lu/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'le Marteau', ipa: '/lə maʁto/', type: 'descriptor_noun', frequency: 0.5 },
      { text: 'le Faucon', ipa: '/lə fokɔ̃/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Monsieur', ipa: '/məsjø/', position: 'prefix', frequency: 1.0 },
      { text: 'Chevalier', ipa: '/ʃəvalje/', position: 'prefix', frequency: 0.7 },
      { text: 'Comte', ipa: '/kɔ̃t/', position: 'prefix', frequency: 0.5 },
    ],
    nicknames: [
      { text: 'Petit', ipa: '/pəti/', frequency: 0.6 },
      { text: 'Roux', ipa: '/ʁu/', frequency: 0.5 },
    ],
  },
  'es-es': {
    descriptors: [
      { text: 'el Grande', ipa: '/el ˈɡɾande/', type: 'descriptor', frequency: 1.0 },
      { text: 'el Sabio', ipa: '/el ˈsaβjo/', type: 'descriptor', frequency: 0.8 },
      { text: 'el Fuerte', ipa: '/el ˈfweɾte/', type: 'descriptor', frequency: 0.6 },
      { text: 'el Bravo', ipa: '/el ˈbɾaβo/', type: 'descriptor', frequency: 0.6 },
    ],
    descriptor_nouns: [
      { text: 'el León', ipa: '/el leˈon/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'el Lobo', ipa: '/el ˈloβo/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'el Toro', ipa: '/el ˈtoɾo/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'el Águila', ipa: '/el ˈaɣila/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Don', ipa: '/don/', position: 'prefix', frequency: 1.0 },
      { text: 'Capitán', ipa: '/kapitan/', position: 'prefix', frequency: 0.7 },
      { text: 'Comandante', ipa: '/komandaNte/', position: 'prefix', frequency: 0.5 },
    ],
    nicknames: [
      { text: 'Peque', ipa: '/peke/', frequency: 0.6 },
      { text: 'Chino', ipa: '/tʃino/', frequency: 0.5 },
    ],
  },
  'es-mx': {
    descriptors: [
      { text: 'el Grande', ipa: '/el ˈɡɾande/', type: 'descriptor', frequency: 1.0 },
      { text: 'el Fuerte', ipa: '/el ˈfweɾte/', type: 'descriptor', frequency: 0.7 },
    ],
    descriptor_nouns: [
      { text: 'el Águila', ipa: '/el ˈaɣila/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'el Jaguar', ipa: '/el xaˈɣwaɾ/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'el Serpiente', ipa: '/el seɾˈpjente/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Don', ipa: '/don/', position: 'prefix', frequency: 1.0 },
      { text: 'Capitán', ipa: '/kapitan/', position: 'prefix', frequency: 0.7 },
    ],
    nicknames: [
      { text: 'Güero', ipa: '/ˈɡweɾo/', frequency: 0.6 },
      { text: 'Chapo', ipa: '/ˈtʃapo/', frequency: 0.5 },
    ],
  },
  'ar-sa': {
    descriptors: [
      { text: 'al-Kabīr', ipa: '/al kaˈbiːɾ/', type: 'descriptor', frequency: 1.0 },
      { text: 'al-Ḥakīm', ipa: '/al ħaˈkiːm/', type: 'descriptor', frequency: 0.8 },
      { text: 'al-Qawī', ipa: '/al qaˈwiː/', type: 'descriptor', frequency: 0.7 },
      { text: 'al-Shujāʿ', ipa: '/al ʃuˈdʒaːʕ/', type: 'descriptor', frequency: 0.6 },
    ],
    descriptor_nouns: [
      { text: 'al-Asad', ipa: '/al ˈasad/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'al-Nasr', ipa: '/al ˈnasɾ/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'al-Sayf', ipa: '/al ˈsajf/', type: 'descriptor_noun', frequency: 0.6 },
      { text: 'al-Ṣaqr', ipa: '/al ˈsˤaqr/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Sayyid', ipa: '/ˈsajjid/', position: 'prefix', frequency: 1.0 },
      { text: 'Amīr', ipa: '/aˈmiːɾ/', position: 'prefix', frequency: 0.7 },
      { text: 'Shaykh', ipa: '/ˈʃajx/', position: 'prefix', frequency: 0.6 },
    ],
    nicknames: [
      { text: 'Abū', ipa: '/aˈbuː/', frequency: 0.7 },
      { text: 'Ibn', ipa: '/ibn/', frequency: 0.6 },
    ],
  },
  'ar-eg': {
    descriptors: [
      { text: 'al-Kabīr', ipa: '/al kaˈbiːɾ/', type: 'descriptor', frequency: 1.0 },
      { text: 'al-Ḥakīm', ipa: '/al ħaˈkiːm/', type: 'descriptor', frequency: 0.8 },
      { text: 'al-Qawī', ipa: '/al qaˈwiː/', type: 'descriptor', frequency: 0.7 },
    ],
    descriptor_nouns: [
      { text: 'al-Asad', ipa: '/al ˈasad/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'al-Nasr', ipa: '/al ˈnasɾ/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'al-Ḥayy', ipa: '/al ˈħajj/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Sayyid', ipa: '/ˈsajjid/', position: 'prefix', frequency: 1.0 },
      { text: 'Basha', ipa: '/ˈbaʃa/', position: 'prefix', frequency: 0.6 },
    ],
    nicknames: [
      { text: 'Abū', ipa: '/aˈbuː/', frequency: 0.7 },
      { text: 'Ibn', ipa: '/ibn/', frequency: 0.6 },
    ],
  },
  'ru-ru': {
    descriptors: [
      { text: 'Velikiy', ipa: '/vʲɪˈlʲikʲɪj/', type: 'descriptor', frequency: 1.0 },
      { text: 'Mudryy', ipa: '/ˈmudrɨj/', type: 'descriptor', frequency: 0.8 },
      { text: 'Silnyy', ipa: '/ˈsʲilʲnɨj/', type: 'descriptor', frequency: 0.7 },
      { text: 'Zhestokiy', ipa: '/ʐɨˈstokʲɪj/', type: 'descriptor', frequency: 0.5 },
    ],
    descriptor_nouns: [
      { text: 'Medved', ipa: '/ˈmʲedvʲɪt/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'Orël', ipa: '/ɐˈrʲol/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'Volk', ipa: '/volk/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'Molot', ipa: '/ˈmolət/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Gospodin', ipa: '/ɡɐspɐˈdʲin/', position: 'prefix', frequency: 0.9 },
      { text: 'Knyaz', ipa: '/kɲas/', position: 'prefix', frequency: 0.6 },
      { text: 'Ataman', ipa: '/ɐtɐˈman/', position: 'prefix', frequency: 0.5 },
    ],
    nicknames: [
      { text: 'Krasnyy', ipa: '/ˈkrasnɨj/', frequency: 0.6 },
      { text: 'Tolstyak', ipa: '/tɐlʲˈstʲak/', frequency: 0.5 },
    ],
  },
  'pl-pl': {
    descriptors: [
      { text: 'Wielki', ipa: '/ˈvʲɛlki/', type: 'descriptor', frequency: 1.0 },
      { text: 'Mądry', ipa: '/ˈmɔndrɨ/', type: 'descriptor', frequency: 0.8 },
      { text: 'Silny', ipa: '/ˈɕilnɨ/', type: 'descriptor', frequency: 0.7 },
    ],
    descriptor_nouns: [
      { text: 'Orzeł', ipa: '/ˈɔʐɛw/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'Niedźwiedź', ipa: '/ˈɲɛd͡ʑvʲjɛt͡ɕ/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'Wilk', ipa: '/vʲilk/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Pan', ipa: '/pan/', position: 'prefix', frequency: 1.0 },
      { text: 'Wódz', ipa: '/vut͡ɕ/', position: 'prefix', frequency: 0.6 },
    ],
    nicknames: [
      { text: 'Czerwony', ipa: '/t͡ʂɛˈrvɔnɨ/', frequency: 0.6 },
      { text: 'Mały', ipa: '/ˈmawɨ/', frequency: 0.5 },
    ],
  },
  'it-it': {
    descriptors: [
      { text: 'il Grande', ipa: '/il ˈɡrande/', type: 'descriptor', frequency: 1.0 },
      { text: 'il Saggio', ipa: '/il ˈsaddʒo/', type: 'descriptor', frequency: 0.8 },
      { text: 'il Forte', ipa: '/il ˈforte/', type: 'descriptor', frequency: 0.6 },
    ],
    descriptor_nouns: [
      { text: 'il Leone', ipa: '/il leˈone/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'il Lupo', ipa: '/il ˈlupo/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'il Falco', ipa: '/il ˈfalko/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Signore', ipa: '/siɲˈɲore/', position: 'prefix', frequency: 1.0 },
      { text: 'Conte', ipa: '/ˈkonte/', position: 'prefix', frequency: 0.6 },
      { text: 'Cavaliere', ipa: '/kavaˈljɛre/', position: 'prefix', frequency: 0.5 },
    ],
    nicknames: [
      { text: 'Rosso', ipa: '/ˈrosso/', frequency: 0.7 },
      { text: 'Piccolo', ipa: '/ˈpikkolo/', frequency: 0.5 },
    ],
  },
  'nl-nl': {
    descriptors: [
      { text: 'de Grote', ipa: '/də ˈɣroːtə/', type: 'descriptor', frequency: 1.0 },
      { text: 'de Wijze', ipa: '/də ˈʋɛizə/', type: 'descriptor', frequency: 0.8 },
      { text: 'de Sterke', ipa: '/də ˈstɛrkə/', type: 'descriptor', frequency: 0.7 },
    ],
    descriptor_nouns: [
      { text: 'de Leeuw', ipa: '/də ˈleːu/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'de Wolf', ipa: '/də ˈʋɔlf/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'de Arend', ipa: '/də ˈaːrənt/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Meneer', ipa: '/məˈneːr/', position: 'prefix', frequency: 1.0 },
      { text: 'Heer', ipa: '/heːr/', position: 'prefix', frequency: 0.8 },
    ],
    nicknames: [
      { text: 'Rood', ipa: '/roːt/', frequency: 0.6 },
      { text: 'Klein', ipa: '/klɛin/', frequency: 0.5 },
    ],
  },
  'sv-se': {
    descriptors: [
      { text: 'den Store', ipa: '/dɛn ˈstuːrə/', type: 'descriptor', frequency: 1.0 },
      { text: 'den Vise', ipa: '/dɛn ˈviːsə/', type: 'descriptor', frequency: 0.8 },
      { text: 'den Starke', ipa: '/dɛn ˈstarːkə/', type: 'descriptor', frequency: 0.7 },
    ],
    descriptor_nouns: [
      { text: 'Björn', ipa: '/bjœːɳ/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'Ormen', ipa: '/ˈɔɹmɛn/', type: 'descriptor_noun', frequency: 0.6 },
      { text: 'Vargen', ipa: '/ˈvaɹjɛn/', type: 'descriptor_noun', frequency: 0.7 },
    ],
    titles: [
      { text: 'Herr', ipa: '/hɛr/', position: 'prefix', frequency: 1.0 },
      { text: 'Jarl', ipa: '/jarl/', position: 'prefix', frequency: 0.6 },
    ],
    nicknames: [
      { text: 'Röd', ipa: '/ɾøːd/', frequency: 0.6 },
      { text: 'Liten', ipa: '/ˈliːtɛn/', frequency: 0.5 },
    ],
  },
  'fi-fi': {
    descriptors: [
      { text: 'Suuri', ipa: '/ˈsuːɾi/', type: 'descriptor', frequency: 1.0 },
      { text: 'Viisas', ipa: '/ˈʋiːsɑs/', type: 'descriptor', frequency: 0.8 },
      { text: 'Vahva', ipa: '/ˈʋɑhʋɑ/', type: 'descriptor', frequency: 0.7 },
    ],
    descriptor_nouns: [
      { text: 'Karhu', ipa: '/ˈkɑɾhu/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'Kotka', ipa: '/ˈkotkɑ/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'Susi', ipa: '/ˈsusi/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Herra', ipa: '/ˈherːɑ/', position: 'prefix', frequency: 1.0 },
    ],
    nicknames: [
      { text: 'Punainen', ipa: '/ˈpunɑi̯nɛn/', frequency: 0.6 },
      { text: 'Pikku', ipa: '/ˈpikːu/', frequency: 0.5 },
    ],
  },
  'ko-kr': {
    descriptors: [
      { text: 'Dae', ipa: '/tɛ/', type: 'descriptor', frequency: 0.9 },
      { text: 'Jihye', ipa: '/tɕiɦje/', type: 'descriptor', frequency: 0.7 },
      { text: 'Yong', ipa: '/joŋ/', type: 'descriptor', frequency: 0.6 },
    ],
    descriptor_nouns: [
      { text: 'Yong', ipa: '/joŋ/', type: 'descriptor_noun', frequency: 0.9 },
      { text: 'Horangi', ipa: '/ɦoɾaŋi/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'Sansu', ipa: '/sansʰu/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Seonsaengnim', ipa: '/sʌnsʰɛŋɲim/', position: 'suffix', frequency: 1.0 },
      { text: 'Janggun', ipa: '/tɕaŋɡun/', position: 'prefix', frequency: 0.6 },
    ],
    nicknames: [
      { text: 'Pal', ipa: '/pal/', frequency: 0.6 },
      { text: 'Dongsaeng', ipa: '/toŋsʰɛŋ/', frequency: 0.5 },
    ],
  },
  'hi-in': {
    descriptors: [
      { text: 'Mahān', ipa: '/məˈɦaːn/', type: 'descriptor', frequency: 1.0 },
      { text: 'Buddhimān', ipa: '/bʊdːʰiˈmaːn/', type: 'descriptor', frequency: 0.8 },
      { text: 'Balvān', ipa: '/bəlˈʋaːn/', type: 'descriptor', frequency: 0.7 },
    ],
    descriptor_nouns: [
      { text: 'Sher', ipa: '/ʃɛːɾ/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'Hāthī', ipa: '/ɦaːˈtʰiː/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'Cītā', ipa: '/t͡ʃiːˈtaː/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Shri', ipa: '/ʃɾiː/', position: 'prefix', frequency: 1.0 },
      { text: 'Raja', ipa: '/ˈɾaːdʒaː/', position: 'prefix', frequency: 0.7 },
      { text: 'Pandit', ipa: '/pənˈdɪt/', position: 'prefix', frequency: 0.6 },
    ],
    nicknames: [
      { text: 'Lāl', ipa: '/laːl/', frequency: 0.7 },
      { text: 'Chhotā', ipa: '/t͡ʃʰoːˈtaː/', frequency: 0.5 },
    ],
  },
  'tl-ph': {
    descriptors: [
      { text: 'Ang Dakila', ipa: '/aŋ daˈkila/', type: 'descriptor', frequency: 1.0 },
      { text: 'Ang Matalino', ipa: '/aŋ mataˈlino/', type: 'descriptor', frequency: 0.8 },
      { text: 'Ang Malakas', ipa: '/aŋ maˈlakas/', type: 'descriptor', frequency: 0.7 },
    ],
    descriptor_nouns: [
      { text: 'Agila', ipa: '/aˈɡila/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'Lobo', ipa: '/ˈlobo/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'Buwaya', ipa: '/buˈwaja/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Ginoo', ipa: '/ɡiˈnoʔo/', position: 'prefix', frequency: 1.0 },
      { text: 'Datu', ipa: '/ˈdatu/', position: 'prefix', frequency: 0.6 },
    ],
    nicknames: [
      { text: 'Pula', ipa: '/ˈpula/', frequency: 0.6 },
      { text: 'Maliit', ipa: '/maˈliʔit/', frequency: 0.5 },
    ],
  },
  'no-no': {
    descriptors: [
      { text: 'den Store', ipa: '/dɛn ˈstuːɾə/', type: 'descriptor', frequency: 1.0 },
      { text: 'den Vise', ipa: '/dɛn ˈʋiːsə/', type: 'descriptor', frequency: 0.8 },
      { text: 'den Sterke', ipa: '/dɛn ˈstɛɾkə/', type: 'descriptor', frequency: 0.7 },
    ],
    descriptor_nouns: [
      { text: 'Bjørnen', ipa: '/ˈbjœːɳən/', type: 'descriptor_noun', frequency: 0.8 },
      { text: 'Ulven', ipa: '/ˈʉlvən/', type: 'descriptor_noun', frequency: 0.7 },
      { text: 'Ørnen', ipa: '/ˈœːɳən/', type: 'descriptor_noun', frequency: 0.6 },
    ],
    titles: [
      { text: 'Herr', ipa: '/hɛr/', position: 'prefix', frequency: 1.0 },
      { text: 'Jarl', ipa: '/jarl/', position: 'prefix', frequency: 0.6 },
    ],
    nicknames: [
      { text: 'Rød', ipa: '/ɾøː/', frequency: 0.6 },
      { text: 'Liten', ipa: '/ˈliːtɛn/', frequency: 0.5 },
    ],
  },
};

// Default fallback data for any LC not explicitly defined
const DEFAULT_DATA = CULTURAL_DATA['en-us'];

function mergeData(lcId) {
  return CULTURAL_DATA[lcId] || DEFAULT_DATA;
}

const files = readdirSync(LC_DIR).filter((f) => f.endsWith('.json'));

for (const file of files) {
  const lcId = basename(file, '.json');
  const path = resolve(LC_DIR, file);
  const profile = JSON.parse(readFileSync(path, 'utf-8'));

  const data = mergeData(lcId);

  profile.descriptors = data.descriptors;
  profile.descriptor_nouns = data.descriptor_nouns;
  profile.titles = data.titles;
  profile.nicknames = data.nicknames;

  writeFileSync(path, JSON.stringify(profile, null, 2) + '\n');
  console.log(`✓ ${lcId}: +${data.descriptors.length} descriptors, +${data.descriptor_nouns.length} noun-descriptors, +${data.titles.length} titles, +${data.nicknames.length} nicknames`);
}

console.log(`\nBootstrapped ${files.length} LC profiles with descriptor data.`);
