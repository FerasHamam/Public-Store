const deleteProduct = (btn)=>{
    productId = btn.parentNode.querySelector('[name=productId]').value;
    csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    elementNode = btn.closest('article');
    fetch('/admin/deleteProduct/'+productId, {
        method:'Delete',
        headers:{
            'csrf-token': csrf
        }
    }).then(result=>{
        return result.json();
    }).then(data=>{
        console.log(data);
        elementNode.parentNode.removeChild(elementNode);
    }).catch(err=>console.log(err));
};