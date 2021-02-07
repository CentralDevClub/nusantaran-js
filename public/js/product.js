const toogleForm = (btn)=>{
    const productForm = document.querySelector('#product_form');
    if (productForm.style.display == 'none'){
        productForm.style.display = 'block';
        btn.innerHTML = 'v';
    } else {
        productForm.style.display = 'none';
        btn.innerHTML = '>';
    }
};