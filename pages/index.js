import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState } from 'react'

export const getStaticProps = async () => {
  // The following is API call to fetch all characters data.
  // The `apikey` part in the URL is md5 hash of my `ts+privateKey+publicKey`.
  const res = await fetch ("http://gateway.marvel.com/v1/public/comics?ts=1&apikey=5b126db01a166d535919eed54ba9ca7f&hash=514290e681b5aadc2979336c10699ff5");
  const data = await res.json();
  const results = data.data.results;
  const availableCharacters = results.filter(result => result.characters.available > 0);
  const characterData = [];
  for(let i=0; i<availableCharacters.length; i++) {
    const characterInfo = (availableCharacters[i].characters.items)
    for(let j=0; j<characterInfo.length; j++) {
      characterData.push(characterInfo[j]);
    }
  }
  
  // Create a new array of unique Character Objects.
  const uniqueCharObj = [];  
  characterData.map(x => uniqueCharObj.filter(a => a.resourceURI == x.resourceURI && a.name == x.name).length > 0 ? null : uniqueCharObj.push(x));

  // Create new array with required elements.
  const newArray = [];
  for(let k=0; k<uniqueCharObj.length; k++) {
    const resourceURI = (uniqueCharObj[k].resourceURI);
      // For each unique character make API call based on the `resourceURI` to get respective image URL and other details.
    const request = resourceURI + '?ts=1&apikey=5b126db01a166d535919eed54ba9ca7f&hash=514290e681b5aadc2979336c10699ff5';
    const res = await fetch (request);
    const data = await res.json();
    const results = data.data.results[0].thumbnail.path;
    const url = results + '.jpg';
    const description = data.data.results[0].description;
    const stories = data.data.results[0].stories.available;
    const newElem = {
      resourceURI: resourceURI, 
      name: uniqueCharObj[k].name,
      imageURL: url,
      description: description,
      stories: stories
    };
    newArray.push (newElem);
  }

  return {
    props: {
      resData : newArray,
    },
  };
};

const home = ({ resData }) => {
  const [query, setQuery] = useState("")
  const [showMe, setShowMe] = useState(false);
  function toggle(){
    setShowMe(!showMe);
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>Marvel Character Finder</title>
        <meta name="description" content="Find a Marvel character" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Marvel Character Finder</h1>
        <input type="text" name="query" className={styles.input} placeholder={`Start typing here...`} onChange={event => setQuery(event.target.value)} />

        {resData.filter(post => {
          const character = post.name
          if (query === "") {
            // return all values when query is empty
            return post;
          } else if (character.toLowerCase().includes(query.toLowerCase())) {
            // return filtered results from array
            return post;
          }
        })
        .map((post, index) => {
          if (post.name){
            return (
              <div className={styles.card} key={index}>
                <div className={styles.cardContent} onClick={toggle}>
                  <img className={styles.image} src={post.imageURL} alt={(post.name)}/>
                  <h3 className={styles.name}>{(post.name)}</h3>
                </div>
                <div className={styles.toggleContent} style={{display: showMe?"block":"none"}}>
                  <p className={styles.details}>{(post.description)}</p><br/>
                  <p className={styles.stories}>Stories available : {(post.stories)}</p>
                </div>
              </div>
            )
          }
          return;
        })
        }
      </main>
    </div>
  );
};

export default home;
