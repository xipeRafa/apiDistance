const express = require('express');
const colors = require('colors');
const cors = require('cors');
const { json } = require('body-parser');
const morgan = require('morgan')

const app = express();

app.use(cors());
app.use(json());
app.use(morgan('tiny'))



function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2){
    
      let R = 6371; //radius of the eart in km
      let dLat = deg2rad(lat2-lat1) 
      let dLon = deg2rad(lon2-lon1)
      
      let a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      let distance = R * c;  //Distance in KM
      return distance
          
}
  
function deg2rad(deg){
    return deg * (Math.PI/180)
}




let cities = [

  ['Paris', 48.856614, 2.352222],

  ['Marseille', 43.296482, 5.369780],

  ['Lyon', 45.764043, 4.835659],

  ['Toulouse', 43.604652, 1.444209],

  ['Nice', 43.710173, 7.261953],

  ['Nantes', 47.218371, -1.553621],

  ['Strasbourg', 48.573405, 7.752111],

  ['Montpellier', 43.610769, 3.876716],

  ['Bordeaux', 44.837789, -0.579180],

  ['Lille', 50.629250, 3.057256],

  ['Rennes', 48.117266, -1.677793],

  ['Reims', 49.258329, 4.031696],

  ['Le Havre', 49.494370, 0.107929],

  ['Saint-Étienne', 45.439695, 4.387178],

  ['Toulon', 43.124228, 5.928000],

  ['Angers', 47.478419, -0.563166],

  ['Grenoble', 45.188529, 5.724524],

  ['Dijon', 47.322047, 5.041480],

  ['Nîmes', 43.836699, 4.360054],

  ['Aix-en-Provence', 43.529742, 5.447427]
]



for (let index = 0; index < cities.length; index++) {
    cities[index][0] = cities[index][0].normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

console.log('cities Clean:>> ', cities);




let citiesListServer = []

for (let index = 0; index < cities.length; index++) {
    const element = cities[index][0]
    citiesListServer.push(element)
}



let ArrayFlat = cities.flat()





app.get('/api/cities', (req, res) => {

        let zz = req._parsedUrl.search.slice(1, -1)

        let by_y = zz.split('&')

        let findQuery = []
     
  
        for (let index = 0; index < by_y.length; index++) {
            const element = by_y[index].split('=')
            findQuery.push(element)
        }

        let objQuery = Object.fromEntries(findQuery)

        const {origen, destiny, passengers, date, ...rest } = objQuery

        let originToDestiny = ArrayFlat.findIndex(el => el === origen)
        console.log('originToDestiny :>> ', originToDestiny);
	    let latitudOrigen = ArrayFlat[originToDestiny +1]
      	let longitudOrigen = ArrayFlat[originToDestiny +2]


        let toDestiny = ArrayFlat.findIndex(el => el === destiny) 
	    let latitudDestiny = ArrayFlat[toDestiny +1]
      	let longitudDestiny = ArrayFlat[toDestiny +2]



	    let originToDestinyVal = getDistanceFromLatLonInKm(latitudOrigen, longitudOrigen, latitudDestiny, longitudDestiny) 
        
        let inters = Object.values(rest)

        let intersKMS = {}

        for (let index = 0; index < inters.length; index++) {
            const element = inters[index];
            intersKMS[element]

            let indexIn = ArrayFlat.findIndex(el => el === element)
            let latitud = ArrayFlat[indexIn +1]
            let longitud = ArrayFlat[indexIn +2]

            let kms = getDistanceFromLatLonInKm(latitudOrigen, longitudOrigen, latitud, longitud)
            intersKMS[element]=kms
        } 

        let dp = {passengers, date}
        let post = {origen, destiny}

    

    try{

            return res.send({originToDestinyVal, intersKMS, dp, post})

	} catch (error) {
		    console.log('error get:', error)
	  	    res.status(500).json({ ok: false, errors:[{msg: 'Bad server Get --- controller'}]});
    }

})




app.post('/api/cities/search', (req, res) => {
    const { finding } = req.body
  

    let capitalized = finding[0].toUpperCase() + finding.substring(1)
  
    try{

        let inFind = citiesListServer.filter((el) => el.indexOf(capitalized) > -1)

        return res.send(inFind) 

    }catch(error){
        console.log('error post:', error)
        res.status(500).json({ ok: false, errors:[{msg: 'Bad server Post --- controller'}]});
    }

})



const PORT = 7000;

app.listen(PORT, console.log(`Server running on port ${PORT}`.blue.bold));
