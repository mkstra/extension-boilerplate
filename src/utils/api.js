var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");


export const getSentences = (sample) => fetch("http://0.0.0.0:8000/similar_sentences",
{
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({"sentence_text":sample,"k":5}),
    redirect: 'follow'
  }
)
  .then(response => response.json())
  .catch(error => console.log('error', error));