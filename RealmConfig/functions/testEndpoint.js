exports = function(request){
 
  const region = request.query;
  console.log('hi!', JSON.stringify(region));
  return region;
};