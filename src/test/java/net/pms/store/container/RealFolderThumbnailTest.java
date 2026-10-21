package net.pms.store.container;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import net.pms.PMS;
import net.pms.configuration.UmsConfiguration;
import net.pms.dlna.DLNAThumbnailInputStream;
import net.pms.renderers.Renderer;
import net.pms.store.item.RealFile;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class RealFolderThumbnailTest {

	private static final String JPEG_RESOURCE = "/net/pms/parsers/image-jpeg.jpg";
	private static final String PNG_RESOURCE = "/net/pms/parsers/image-png.png";
	private static Renderer renderer;

	@BeforeAll
	static void configure() throws Exception {
		System.setProperty(PMS.PROPERTY_RUNNING_TESTS, "true");
		PMS.setConfiguration(new UmsConfiguration(false));
		renderer = new Renderer((String) null);
	}

	@Test
	void inheritsArtworkFromDirectVideo(@TempDir Path folder) throws Exception {
		createVideo(folder.resolve("movie.mkv"));
		copyResource(PNG_RESOURCE, folder.resolve("movie.png"));

		DLNAThumbnailInputStream actual = new RealFolder(renderer, folder.toFile()).getThumbnailInputStream();

		assertNotNull(actual);
		assertArrayEquals(thumbnailBytes(PNG_RESOURCE), actual.getBytes(false));
	}

	@Test
	void explicitFolderArtworkTakesPriority(@TempDir Path folder) throws Exception {
		createVideo(folder.resolve("movie.mkv"));
		copyResource(PNG_RESOURCE, folder.resolve("movie.png"));
		copyResource(JPEG_RESOURCE, folder.resolve("folder.jpg"));

		DLNAThumbnailInputStream actual = new RealFolder(renderer, folder.toFile()).getThumbnailInputStream();

		assertNotNull(actual);
		assertArrayEquals(thumbnailBytes(JPEG_RESOURCE), actual.getBytes(false));
	}

	@Test
	void usesFirstDirectVideoInStableFilenameOrder(@TempDir Path folder) throws Exception {
		createVideo(folder.resolve("b-movie.mkv"));
		copyResource(JPEG_RESOURCE, folder.resolve("b-movie.jpg"));
		createVideo(folder.resolve("A-movie.mkv"));
		copyResource(PNG_RESOURCE, folder.resolve("A-movie.png"));

		DLNAThumbnailInputStream actual = new RealFolder(renderer, folder.toFile()).getThumbnailInputStream();

		assertNotNull(actual);
		assertArrayEquals(thumbnailBytes(PNG_RESOURCE), actual.getBytes(false));
	}

	@Test
	void doesNotInheritFromNestedFolders(@TempDir Path folder) throws Exception {
		Path nestedFolder = Files.createDirectory(folder.resolve("nested"));
		createVideo(nestedFolder.resolve("movie.mkv"));
		copyResource(PNG_RESOURCE, nestedFolder.resolve("movie.png"));

		DLNAThumbnailInputStream actual = new RealFolder(renderer, folder.toFile()).getThumbnailInputStream();

		assertNotNull(actual);
		assertFalse(Arrays.equals(thumbnailBytes(PNG_RESOURCE), actual.getBytes(false)));
	}

	@Test
	void mediaArtworkLookupDoesNotReturnGenericVideoIcon(@TempDir Path folder) throws Exception {
		Path video = folder.resolve("movie.mkv");
		createVideo(video);
		RealFile realFile = new RealFile(renderer, video.toFile());

		assertTrue(realFile.isValid());
		assertNull(realFile.getMediaThumbnailInputStream());
		assertNotNull(realFile.getThumbnailInputStream());
	}

	private static void createVideo(Path path) throws IOException {
		Files.write(path, new byte[] {0, 1, 2, 3, 4, 5, 6, 7});
	}

	private static void copyResource(String resource, Path target) throws IOException {
		try (InputStream input = RealFolderThumbnailTest.class.getResourceAsStream(resource)) {
			assertNotNull(input, "Missing test resource " + resource);
			Files.copy(input, target);
		}
	}

	private static byte[] thumbnailBytes(String resource) throws IOException {
		try (InputStream input = RealFolderThumbnailTest.class.getResourceAsStream(resource)) {
			assertNotNull(input, "Missing test resource " + resource);
			DLNAThumbnailInputStream thumbnail = DLNAThumbnailInputStream.toThumbnailInputStream(input);
			assertNotNull(thumbnail);
			return thumbnail.getBytes(false);
		}
	}
}
