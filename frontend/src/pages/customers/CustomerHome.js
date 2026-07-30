import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

function CustomerHome() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });

  // Fetch products from FastAPI
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError("Failed to fetch products: " + (err.message || "Unknown error"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchProducts();
      }
    };

    const intervalId = window.setInterval(() => {
      fetchProducts();
    }, 5000);

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value || "" });
  };

  const addProduct = async () => {
    if (!form.name || !form.description || !form.price || !form.quantity) {
      setError("All fields are required");
      return;
    }
    try {
      const productData = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
      };
      if (editingId) {
        await API.put(`/products/${editingId}`, productData);
        setSuccess("Product updated successfully");
        setEditingId(null);
      } else {
        await API.post("/products", productData);
        setSuccess("Product added successfully");
      }
      fetchProducts();
      setForm({ name: "", description: "", price: "", quantity: "" });
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error saving product: " + (err.response?.data?.detail || err.message));
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await API.delete(`/products/${id}`);
        setSuccess("Product deleted successfully");
        fetchProducts();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError("Error deleting product: " + (err.message || "Unknown error"));
      }
    }
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", description: "", price: "", quantity: "" });
  };

  return (
    <div className="container">
      <h1>Product Cart</h1>

      <div className="form">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} type="number" />
        <input name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} type="number" />
        <button onClick={addProduct}>{editingId ? "Update" : "Add"}</button>
        {editingId && <button onClick={cancelEdit} className="cancel">Cancel</button>}
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="6">No products found.</td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>${p.price}</td>
                <td>{p.quantity}</td>
                <td>
                  <button className="edit" onClick={() => editProduct(p)}>Edit</button>
                  <button className="delete" onClick={() => deleteProduct(p.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerHome;
