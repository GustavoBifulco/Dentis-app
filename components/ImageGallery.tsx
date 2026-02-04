import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Camera, Upload, Trash2, Maximize2, X } from 'lucide-react';
import { IslandCard, LuxButton } from './Shared';

interface ImageDoc {
    id: number;
    url: string;
    name: string;
    createdAt: string;
    type: string;
}

interface ImageGalleryProps {
    patientId: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ patientId }) => {
    const { getToken } = useAuth();
    const [images, setImages] = useState<ImageDoc[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImageDoc | null>(null);

    useEffect(() => {
        fetchImages();
    }, [patientId]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`/api/records/images/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setImages(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Placeholder upload (would integrate with S3/UploadThing in real app)
    const handleUpload = async () => {
        alert("Upload functionality to be implemented with storage provider.");
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 relative animate-in fade-in">
            {/* Toolbar */}
            <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Camera size={20} className="text-blue-500" /> Galeria de Imagens ({images.length})
                </h3>
                <LuxButton onClick={handleUpload} icon={<Upload size={16} />}>Nova Foto</LuxButton>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="text-center py-10 text-slate-400">Carregando imagens...</div>
                ) : images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Camera size={48} className="mb-4 opacity-50" />
                        <p>Nenhuma imagem registrada.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.map(img => (
                            <div
                                key={img.id}
                                onClick={() => setSelectedImage(img)}
                                className="group relative aspect-square bg-slate-200 rounded-lg overflow-hidden cursor-pointer border hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
                            >
                                <img
                                    src={img.url}
                                    alt={img.name}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Maximize2 className="text-white drop-shadow-md" size={24} />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-2 truncate">
                                    {img.name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox / Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                    >
                        <X size={24} />
                    </button>
                    <div className="max-w-[90vw] max-h-[90vh]">
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.name}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-black"
                        />
                        <div className="text-white text-center mt-4">
                            <h4 className="font-bold text-lg">{selectedImage.name}</h4>
                            <p className="text-slate-400 text-sm">Adicionado em {new Date(selectedImage.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
