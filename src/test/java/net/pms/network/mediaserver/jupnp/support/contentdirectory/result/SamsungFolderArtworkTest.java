package net.pms.network.mediaserver.jupnp.support.contentdirectory.result;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import java.io.File;
import java.nio.file.Path;
import net.pms.PMS;
import net.pms.configuration.RendererConfiguration;
import net.pms.configuration.UmsConfiguration;
import net.pms.dlna.DLNAImageProfile;
import net.pms.network.mediaserver.jupnp.support.contentdirectory.result.namespace.upnp.UPNP;
import net.pms.renderers.Renderer;
import net.pms.store.container.RealFolder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class SamsungFolderArtworkTest {

	@Test
	void matchedUhdProfileOffersOneJpegArtworkUri(@TempDir Path directory) throws Exception {
		System.setProperty(PMS.PROPERTY_RUNNING_TESTS, "true");
		PMS.setConfiguration(new UmsConfiguration(false));
		RendererConfiguration configuration = new RendererConfiguration(new File("src/main/external-resources/renderers/Samsung-UHD.conf"));
		assertEquals("JPEG_SM", configuration.getAlbumArtProfile());
		assertTrue(configuration.needVersionedObjectId());
		Renderer renderer = new Renderer(configuration);
		RealFolder folder = new RealFolder(renderer, directory.toFile()) {
			@Override
			public String getThumbnailURL(DLNAImageProfile profile) {
				return "http://192.0.2.1/thumbnail/" + profile + ".jpg";
			}
		};
		folder.setId("-1");
		var result = StoreResourceHelper.getContainer(folder, "*");
		var artwork = result.getProperties().getAll(UPNP.AlbumArtURI.class);
		assertEquals(1, artwork.size());
		assertTrue(artwork.get(0).getValue().toString().contains("JPEG_SM"));
	}
}
