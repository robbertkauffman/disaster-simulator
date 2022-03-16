exports = function(request){
 
  const r = request.query;
  console.log('hi!', JSON.stringify(r));
  return r;
};