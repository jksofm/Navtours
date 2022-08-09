class APIFeatures {
    constructor(query,queryString){
      this.query = query;
      this.queryString=queryString;
    }
    filter(){
      const queryObj = {...this.queryString}
      const excludedFields = ["page","sort","limit","fields"];
      excludedFields.forEach((el)=> {
        if(queryObj[el]){
          delete queryObj[el]
        }
      })
  
      let queryStr = JSON.stringify(queryObj);
      queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,(match) =>`$${match}`)
  
      // let query = Tour.find(JSON.parse(queryStr));
      this.query.find(JSON.parse(queryStr));
      return this;
      
  
    }
    sort(){
      if(this.queryString.sort){
        const sortBy = this.queryString.sort.split(',').join(" ");
        this.query = this.query.sort(sortBy);
      
    
        //sort=price,ratingsAverage => sort("price ratingsAverage")
    
      }else{
        this.query = this.query.sort("-createdAt");
      }
      return this;
    }
    limitFields(){
      if(this.queryString.fields){
        //fields=name,duration,difficulty,price => query.select("name duration difficulty price");
        //add minus before fields if you want to exclude these fields
        const fields = this.queryString.fields.split(",").join(" ");
        this.query = this.query.select(fields);
    
       }else{
        this.query = this.query.select("-__v");
       }
       return this;
    }
    pagination(){
   ///page=2&limit=10
    
   const page = parseInt(this.queryString.page) || 1;
   const limit = this.queryString.limit *1 || 9;
   const skip = (page - 1) * limit ;
   this.query = this.query.skip(skip).limit(limit)
  
  return this;
    }
  }
  module.exports= APIFeatures;