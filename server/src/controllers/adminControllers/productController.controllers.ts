import { Request, Response } from 'express';
import Product, { IProduct } from '../../models/Product';

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price, category, images, stock, variants } = req.body;

        if (!name || !description || (!price && price !== 0) || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, price, and category are required',
            });
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            images,
            stock,
            variants,
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Product creation failed',
            error: (error as Error).message,
        });
    }
};

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        // Filtering
        const filter: any = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }
        if (req.query.inStock === 'true') filter.stock = { $gt: 0 };

        // Search (text index on name/description recommended)
        if (req.query.search) {
            filter.$text = { $search: req.query.search as string };
        }

        // Sorting
        let sort: any = {};
        switch (req.query.sort) {
            case 'price_asc':
                sort.price = 1;
                break;
            case 'price_desc':
                sort.price = -1;
                break;
            case 'createdAt_desc':
                sort.createdAt = -1;
                break;
            case 'createdAt_asc':
                sort.createdAt = 1;
                break;
            default:
                sort.createdAt = -1; // Default to newest first
        }

        // Query database
        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec();

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            products,
            page,
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: (error as Error).message,
        });
    }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: (error as Error).message,
        });
    }
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const product = await Product.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Product update failed',
            error: (error as Error).message,
        });
    }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Product deletion failed',
            error: (error as Error).message,
        });
    }
};

// Update product stock (for admin inventory management)
export const updateProductStock = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        if (stock === undefined || stock === null) {
            return res.status(400).json({
                success: false,
                message: 'Stock value is required',
            });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { stock },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            message: 'Product stock updated',
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Stock update failed',
            error: (error as Error).message,
        });
    }
};
