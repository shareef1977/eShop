$("#update_user").submit(function(event){
    // event.preventDefault();

    let unindexed_array = $(this).serializeArray()
    let data={}

    $.map(unindexed_array, function(n,i){ 
        data[n['name']]=n['value']
    })
    console.log(data)

    let request = {
        "url" : `http://localhost:7000/edit_product/update/${data.id}`,
        "method":"PUT",
        "data": data
    }
    $.ajax(request).done(function(response){
        alert("Data Updated Successfully")
    })
})