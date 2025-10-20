import { useEffect, useState } from "react";

export default function page() {
    const [products, setProducts] = useState<Array<{ id: number; name: string }>>([]);

    useEffect(() => {
        setTimeout(() => {
            setProducts([
                { id: 1, name: "Margherita" },
                { id: 2, name: "Pepperoni" },
                { id: 3, name: "Hawaiian" },
            ]);
        }, 1000);
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Our Pizzas</h1>
            <ul className="space-y-2">
                {products.map((product) => (
                    <li key={product.id} className="p-4 border rounded shadow">
                        {product.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}